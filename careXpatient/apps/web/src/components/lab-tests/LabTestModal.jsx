"use client";

import { useState, useCallback } from 'react';


// Alternative labs for the same test to support dynamic pricing
const ALTERNATIVE_LABS = [
{ name: 'careX Lab', discount: 0 },
{ name: 'Metro Diagnostics', discount: 0.1 }, // 10% cheaper
{ name: 'Labaid Diagnostics', discount: -0.05 }, // 5% more expensive
{ name: 'Popular Diagnostic Center', discount: 0.05 }];





















export function LabTestModal({ isOpen, onClose, test, isInCart, onAddToCart }) {
  const [selectedLab, setSelectedLab] = useState('');
  const [added, setAdded] = useState(false);

  // Reset when test changes
  const getSelectedLab = () => selectedLab || (test?.labName ?? '');

  const getLabPrice = useCallback((labName, basePrice) => {
    const lab = ALTERNATIVE_LABS.find((l) => l.name === labName);
    if (!lab) return basePrice;
    return Math.round(basePrice * (1 - lab.discount));
  }, []);

  if (!isOpen || !test) return null;

  const displayPrice = getLabPrice(getSelectedLab(), test.price);

  const handleAddToCart = () => {
    if (isInCart) {onClose();return;}
    onAddToCart(test, getSelectedLab(), displayPrice);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose} />
      

      {/* Modal Panel */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header stripe */}
        <div className="bg-gradient-to-r from-primary to-teal-500 p-8 pb-6 rounded-t-[2rem] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
            
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          {test.tag &&
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
            typeof test.tagColor === 'string' && test.tagColor.startsWith('#') ?
            '' :
            test.tagColor || 'bg-white/20 text-white'}`
            }
            style={
            typeof test.tagColor === 'string' && test.tagColor.startsWith('#') ?
            {
              backgroundColor: `${test.tagColor}30`,
              color: '#ffffff',
              border: `1px solid ${test.tagColor}80`
            } :
            undefined
            }>
            
              {test.tag}
            </span>
          }
          <h2 className="text-2xl font-bold text-white pr-10">{test.name}</h2>
          <p className="text-white/80 text-sm mt-1">{test.description}</p>
        </div>

        <div className="p-8">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
            { icon: 'no_food', label: 'Fasting', value: test.prerequisites },
            { icon: 'schedule', label: 'Report Delivery', value: test.deliveryTime },
            { icon: 'science', label: 'Sample Type', value: test.sampleType }].
            map((item) =>
            <div key={item.label} className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm text-on-surface font-medium leading-snug">{item.value}</p>
              </div>
            )}
          </div>

          {/* Lab Selection */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">
              Select Lab
            </h4>
            <div className="space-y-3">
              {ALTERNATIVE_LABS.map((lab) => {
                const labPrice = getLabPrice(lab.name, test.price);
                const isSelected = getSelectedLab() === lab.name;
                return (
                  <label
                    key={lab.name}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected ?
                    'border-primary bg-primary/5' :
                    'border-slate-100 hover:border-primary/30 hover:bg-slate-50'}`
                    }>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-primary' : 'border-slate-300'}`
                      }>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{lab.name}</p>
                        <p className="text-xs text-subtle-gray">Accredited · Same day collection available</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        ৳{labPrice.toLocaleString()}
                      </p>
                      {lab.discount > 0 &&
                      <span className="text-xs text-green-600 font-bold">
                          {Math.round(lab.discount * 100)}% off
                        </span>
                      }
                    </div>
                    <input
                      type="radio"
                      name="lab"
                      value={lab.name}
                      checked={isSelected}
                      onChange={() => setSelectedLab(lab.name)}
                      className="sr-only" />
                    
                  </label>);

              })}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-subtle-gray uppercase tracking-wider mb-1">
                {getSelectedLab()}
              </p>
              <p className="text-4xl font-black text-primary">৳{displayPrice.toLocaleString()}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isInCart || added ?
              'bg-green-500 text-white cursor-default' :
              'bg-primary text-white hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5'}`
              }>
              
              <span className="material-symbols-outlined">
                {isInCart || added ? 'check_circle' : 'add_shopping_cart'}
              </span>
              {isInCart ? 'Already in Cart' : added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>);

}