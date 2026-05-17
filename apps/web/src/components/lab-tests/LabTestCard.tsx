"use client";

interface LabTestCardProps {
  id: string;
  name: string;
  tag: string;
  tagColor?: string;
  description: string;
  labName: string;
  price: number;
  timeInfo: string;
  inCart: boolean;
  onAddToCart: () => void;
  onClick: () => void;
}

export function LabTestCard({
  name,
  tag,
  tagColor = "bg-primary/10 text-primary",
  description,
  labName,
  price,
  timeInfo,
  inCart,
  onAddToCart,
  onClick,
}: LabTestCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
      onClick={onClick}
    >
      {/* Decorative bg blob */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors duration-500 pointer-events-none" />

      {/* Top: name + tag */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-on-surface mb-2 leading-tight">{name}</h3>
          {tag && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                typeof tagColor === 'string' && tagColor.startsWith("#")
                  ? ""
                  : (tagColor || "bg-primary/10 text-primary")
              }`}
              style={
                typeof tagColor === 'string' && tagColor.startsWith("#")
                  ? {
                      backgroundColor: `${tagColor}15`,
                      color: tagColor,
                    }
                  : undefined
              }
            >
              {tag}
            </span>
          )}
        </div>
        {inCart && (
          <span className="shrink-0 ml-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-[14px]">check</span>
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-subtle-gray mb-5 flex-1 leading-relaxed relative z-10 line-clamp-2">
        {description}
      </p>

      {/* Time info */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100 mb-4 relative z-10">
        <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
        <span className="text-xs">{timeInfo}</span>
      </div>

      {/* Footer: lab, price, add btn */}
      <div className="flex items-end justify-between relative z-10">
        <div>
          <p className="text-[10px] text-subtle-gray font-semibold uppercase tracking-wider mb-0.5">
            Provided by
          </p>
          <p className="text-sm font-bold text-on-surface">{labName}</p>
          <p className="text-xl font-black text-primary mt-0.5">৳{price.toLocaleString()}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!inCart) onAddToCart();
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            inCart
              ? 'bg-green-500 text-white scale-105 shadow-lg shadow-green-500/30'
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-primary/20'
          }`}
          title={inCart ? 'Already in cart' : 'Add to cart'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {inCart ? 'check' : 'add_shopping_cart'}
          </span>
        </button>
      </div>
    </div>
  );
}
