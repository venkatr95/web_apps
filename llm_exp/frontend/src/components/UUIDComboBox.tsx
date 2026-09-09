import { useState, useRef, useEffect } from 'react';

interface UUIDComboBoxProps {
    uuids: string[];
    selectedUUID: string;
    onUUIDSelect: (uuid: string) => void;
}

function UUIDComboBox({ uuids, selectedUUID, onUUIDSelect }: UUIDComboBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(selectedUUID);
    }, [selectedUUID]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        onUUIDSelect(value);
    };

    const handleDropdownSelect = (uuid: string) => {
        setInputValue(uuid);
        onUUIDSelect(uuid);
        setIsOpen(false);
    };

    return (
        <div className="uuid-selector">
            <label htmlFor="uuid-input">Select or Enter UUID</label>
            <div className="uuid-input-container">
                <input
                    id="uuid-input"
                    type="text"
                    className="uuid-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Enter UUID or select from dropdown..."
                />
                <div className="uuid-dropdown" ref={dropdownRef}>
                    <button
                        className="dropdown-button"
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                    >
                        {isOpen ? '▲ Hide' : '▼ Select'}
                    </button>
                    {isOpen && (
                        <div className="dropdown-menu">
                            {uuids.length === 0 ? (
                                <div className="dropdown-item">No UUIDs available</div>
                            ) : (
                                uuids.map((uuid) => (
                                    <div
                                        key={uuid}
                                        className="dropdown-item"
                                        onClick={() => handleDropdownSelect(uuid)}
                                    >
                                        {uuid}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UUIDComboBox;
