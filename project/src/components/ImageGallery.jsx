import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Search, Filter } from 'lucide-react';
import { defaultImages } from '../data/defaultImages';

export default function ImageGallery({ isOpen, onClose, onSelectImage, selectedImage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadedImages, setUploadedImages] = useState([]);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'academic', label: 'Academic' },
    { value: 'science', label: 'Science' },
    { value: 'technology', label: 'Technology' },
    { value: 'arts', label: 'Arts' },
    { value: 'business', label: 'Business' },
    { value: 'humanities', label: 'Humanities' },
  ];

  const allImages = [...defaultImages, ...uploadedImages];
  
  const filteredImages = allImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage = {
          id: Date.now() + Math.random(),
          url: event.target.result,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: 'custom',
          isCustom: true
        };
        setUploadedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl z-50 flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-700/50">
              <h2 className="text-2xl font-bold text-white">
                Choose Cover Image
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-8 border-b border-gray-700/50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100 placeholder-gray-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-4 bg-gray-800/60 border border-gray-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC]/50 transition-all text-gray-100"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] text-white rounded-2xl cursor-pointer transition-all font-semibold">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage?.id === image.id
                        ? 'border-[#7C5CFC] ring-4 ring-[#7C5CFC]/30'
                        : 'border-transparent hover:border-gray-600'
                    }`}
                    onClick={() => onSelectImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-xs font-medium truncate">
                        {image.title}
                      </p>
                    </div>
                    {selectedImage?.id === image.id && (
                      <div className="absolute inset-0 bg-[#7C5CFC]/20 flex items-center justify-center">
                        <div className="w-10 h-10 bg-[#7C5CFC] rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-700/50">
              <div className="flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-4 text-gray-300 hover:bg-gray-800/60 rounded-2xl transition-colors border border-gray-700/50"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  disabled={!selectedImage}
                  className="px-6 py-4 bg-gradient-to-r from-[#7C5CFC] to-[#6B4CE6] hover:from-[#8B6BFF] hover:to-[#7C5CFC] disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl transition-all font-semibold"
                >
                  Select Image
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}