from openai import OpenAI
from typing import Dict, Any, List
import json
import os
from functools import lru_cache
import hashlib
from datetime import datetime


class UUIDAgent:
    """LLM-powered intelligent agent for form management, duplicate detection, and user learning"""
    
    def __init__(self, api_key: str = None, model: str = None, provider: str = "openai"):
        """
        Initialize agent with specified LLM provider
        
        Args:
            api_key: API key for OpenAI (not needed for LM Studio)
            model: Model name (e.g., "gpt-4o-mini" for OpenAI, "gemma-3" for LM Studio)
            provider: "openai" or "lmstudio"
        """
        self.provider = provider.lower()
        self.cache = {}  # Simple in-memory cache
        
        if self.provider == "lmstudio":
            # LM Studio uses OpenAI-compatible API at localhost
            self.client = OpenAI(
                base_url="http://localhost:1234/v1",
                api_key="lm-studio",
                timeout=15.0  # 15 second timeout for complex operations
            )
            self.model = model or "gemma-3"  # Default to gemma-3 for LM Studio
        else:
            # OpenAI
            self.client = OpenAI(
                api_key=api_key,
                timeout=15.0  # 15 second timeout
            )
            self.model = model or "gpt-4o-mini"
    
    def map_uuid_to_form(self, uuid: str, raw_data: Dict[str, Any], use_llm: bool = True) -> Dict[str, Any]:
        """
        Use LLM to intelligently map and enhance UUID data to form fields
        
        Args:
            uuid: The UUID identifier
            raw_data: Raw data from database
            use_llm: Whether to use LLM processing (default: True)
            
        Returns:
            Dict with mapped form fields
        """
        
        # Check cache first
        cache_key = f"{uuid}_{hashlib.md5(json.dumps(raw_data, sort_keys=True).encode()).hexdigest()}"
        if cache_key in self.cache:
            print(f"Cache hit for UUID: {uuid}")
            return self.cache[cache_key]
        
        # If LLM is disabled, return raw data immediately
        if not use_llm:
            return self._format_raw_data(uuid, raw_data)
        
        system_prompt = """You are a form-filling assistant. Format the data professionally and return JSON with these fields: uuid, name, email, phone, address, company, position, notes. Keep it concise."""
        
        user_prompt = f"""Format this data: {json.dumps(raw_data)}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,  # Lower temperature for faster, more consistent results
                max_tokens=500  # Limit tokens for faster response
            )
            
            result = json.loads(response.choices[0].message.content)
            
            # Ensure UUID is included
            result["uuid"] = uuid
            
            # Ensure all required fields exist
            required_fields = ["uuid", "name", "email", "phone", "address", "company", "position", "notes"]
            for field in required_fields:
                if field not in result:
                    result[field] = raw_data.get(field, "")
            
            # Cache the result
            self.cache[cache_key] = result
            
            return result
            
        except Exception as e:
            print(f"Agent error (falling back to raw data): {str(e)}")
            # Fallback to raw data if agent fails
            return self._format_raw_data(uuid, raw_data)
    
    def _format_raw_data(self, uuid: str, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format raw data without LLM processing"""
        return {
            "uuid": uuid,
            "name": raw_data.get("name", ""),
            "email": raw_data.get("email", ""),
            "phone": raw_data.get("phone", ""),
            "address": raw_data.get("address", ""),
            "company": raw_data.get("company", ""),
            "position": raw_data.get("position", ""),
            "notes": raw_data.get("notes", "")
        }
    
    def detect_duplicates_intelligently(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Use LLM to intelligently detect duplicate records based on semantic similarity
        
        Args:
            records: List of form data records
            
        Returns:
            List of duplicate pairs with reasoning
        """
        if len(records) < 2:
            return []
        
        # Prepare records for analysis (limit to prevent token overflow)
        records_summary = [
            {
                "uuid": r.get("uuid", ""),
                "name": r.get("name", ""),
                "email": r.get("email", ""),
                "company": r.get("company", ""),
                "position": r.get("position", "")
            }
            for r in records[:50]  # Limit to 50 records for performance
        ]
        
        system_prompt = """You are an intelligent duplicate detection system for hospital records. 
        Analyze the provided records and identify potential duplicates based on:
        - Name similarity (including typos, abbreviations, nicknames)
        - Email similarity
        - Same person at different positions or companies
        - Professional context (doctors, patients, workers)
        
        Return a JSON object with a "duplicates" array. Each duplicate should have:
        - uuid1, uuid2: The UUIDs of potential duplicates
        - confidence: 0.0-1.0 (0.85+ is high confidence)
        - reason: Brief explanation why they might be duplicates
        - type: "exact_match", "likely_duplicate", "possible_duplicate"
        
        Only report pairs with confidence >= 0.75."""
        
        user_prompt = f"""Analyze these records for duplicates:\n{json.dumps(records_summary, indent=2)}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=1500
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("duplicates", [])
            
        except Exception as e:
            print(f"Duplicate detection error: {str(e)}")
            return []
    
    def identify_stale_records_intelligently(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Use LLM to intelligently analyze records and identify stale/outdated ones
        
        Args:
            records: List of records with access metadata
            
        Returns:
            Dict with stale records analysis and recommendations
        """
        if not records:
            return {"stale_records": [], "recommendations": []}
        
        # Prepare records for analysis
        records_summary = [
            {
                "uuid": r.get("uuid", ""),
                "name": r.get("name", ""),
                "position": r.get("position", ""),
                "last_accessed": r.get("last_accessed", ""),
                "days_inactive": r.get("days_inactive", 0),
                "access_count": r.get("access_count", 0)
            }
            for r in records[:30]
        ]
        
        system_prompt = """You are an intelligent data management assistant for a hospital system.
        Analyze records to identify:
        1. Truly stale records (likely no longer relevant - old temporary workers, discharged patients)
        2. Important records that just haven't been accessed (permanent staff, key positions)
        3. Recommendations for data cleanup
        
        Return JSON with:
        - stale_records: Array of UUIDs that are likely obsolete with "reason"
        - important_but_inactive: Array of UUIDs that should be kept despite inactivity
        - recommendations: Array of actionable suggestions
        - summary: Overall assessment"""
        
        user_prompt = f"""Analyze these records:\n{json.dumps(records_summary, indent=2)}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1500
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"Stale record analysis error: {str(e)}")
            return {"stale_records": [], "recommendations": []}
    
    def analyze_user_behavior(self, interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Use LLM to analyze user behavior patterns and provide personalized insights
        
        Args:
            interactions: List of user interactions (views, edits, corrections)
            
        Returns:
            Dict with behavior analysis and personalized recommendations
        """
        if not interactions:
            return {
                "patterns": [],
                "preferences": {},
                "recommendations": [],
                "summary": "No interaction data available yet"
            }
        
        # Prepare interaction data
        interaction_summary = [
            {
                "field": i.get("field_name", ""),
                "type": i.get("interaction_type", ""),
                "correction": f"{i.get('original_value', '')} → {i.get('corrected_value', '')}" 
                    if i.get("interaction_type") == "correction" else None
            }
            for i in interactions[-50:]  # Last 50 interactions
        ]
        
        system_prompt = """You are an intelligent assistant that learns user preferences and habits.
        Analyze user interactions to identify:
        1. Most frequently used fields (user preferences)
        2. Common correction patterns (what the user typically changes)
        3. Usage patterns (when, what, how)
        4. Personalized recommendations for improving workflow
        
        Return JSON with:
        - preferred_fields: Array of fields user focuses on most
        - correction_patterns: Common types of corrections with insights
        - time_saving_tips: Suggestions based on observed behavior
        - predicted_defaults: Field values to pre-fill based on patterns
        - summary: Overall behavior assessment"""
        
        user_prompt = f"""Analyze these user interactions:\n{json.dumps(interaction_summary, indent=2)}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1000
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"Behavior analysis error: {str(e)}")
            return {
                "patterns": [],
                "recommendations": [],
                "summary": "Analysis unavailable"
            }
    
    def provide_smart_suggestions(self, current_form: Dict[str, Any], 
                                 user_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Provide intelligent field suggestions based on current context and user history
        
        Args:
            current_form: Current form data being edited
            user_history: User's historical corrections and preferences
            
        Returns:
            Dict with smart suggestions for form fields
        """
        system_prompt = """You are a smart form assistant that provides helpful suggestions.
        Based on the current form and user's past corrections, suggest:
        - Field values that user typically uses
        - Corrections user might want to make
        - Formatting improvements
        
        Return JSON with "suggestions" array, each containing:
        - field: Field name
        - suggested_value: What to suggest
        - reason: Why this suggestion
        - confidence: 0.0-1.0"""
        
        user_prompt = f"""Current form: {json.dumps(current_form, indent=2)}
        User history: {json.dumps(user_history[-10:], indent=2)}"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=800
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"Suggestion error: {str(e)}")
            return {"suggestions": []}
