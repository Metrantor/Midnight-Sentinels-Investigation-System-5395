import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiX } = FiIcons;

const SpeedSearch = ({ 
  items, 
  onSelect, 
  placeholder, 
  displayKey, 
  searchKeys, 
  renderItem, 
  value 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        searchKeys.some(key =>
          item[key]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredItems(filtered);
      setSelectedIndex(-1);
    } else {
      setFilteredItems(items.slice(0, 10)); // Show first 10 items when no search
    }
  }, [searchTerm, items, searchKeys]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setSearchTerm(item[displayKey]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSelection = () => {
    setSearchTerm('');
    onSelect(null);
    setIsOpen(false);
  };

  // Set initial value
  useEffect(() => {
    if (value && value[displayKey]) {
      setSearchTerm(value[displayKey]);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, displayKey]);

  return (
    <div className="relative">
      <div className="relative">
        <SafeIcon 
          icon={FiSearch} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-400" 
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 bg-midnight-800 border border-midnight-600 rounded-lg text-white placeholder-midnight-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
        {searchTerm && (
          <button
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-midnight-400 hover:text-white"
          >
            <SafeIcon icon={FiX} className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredItems.length > 0 && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-midnight-800 border border-midnight-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-midnight-300 hover:bg-midnight-700 hover:text-white'
                }`}
              >
                {renderItem ? renderItem(item) : item[displayKey]}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpeedSearch;