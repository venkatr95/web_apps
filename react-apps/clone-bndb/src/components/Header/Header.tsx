import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Globe, Menu, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { LanguageDialog } from '../../dialogs/LanguageDialog/LanguageDialog';
import { UserMenu } from '../UserMenu/UserMenu';
import { AuthDialog } from '../../dialogs/AuthDialog/AuthDialog';
import { LocationSearch } from '../LocationSearch/LocationSearch';
import { DateRangeCalendar } from '../../widgets/DateRangeCalendar/DateRangeCalendar';
import { GuestSelector } from '../../widgets/GuestSelector/GuestSelector';
import styles from './Header.module.css';

// Rest of the Header component code remains the same