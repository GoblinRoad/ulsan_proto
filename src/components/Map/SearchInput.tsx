import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
                                                     searchTerm,
                                                     setSearchTerm,
                                                     placeholder = "관광지 이름이나 주소로 검색..."
                                                 }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    const handleSearch = () => {
        setSearchTerm(localSearchTerm);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setLocalSearchTerm('');
        setSearchTerm('');
    };

    React.useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    return (
        <div className="relative flex space-x-2">
            <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {localSearchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all text-sm font-medium"
            >
                검색
            </button>
        </div>
    );
};

export default SearchInput;