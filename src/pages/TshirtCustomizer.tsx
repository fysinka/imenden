import { useState, useRef } from 'react';
import { X, Upload, Type, Palette, Eye, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Product, TshirtCustomization, ProductColor } from '../types';

interface Props {
  product: Product;
  onClose: () => void;
  onDone: (customization: TshirtCustomization) => void;
}

const FONTS = ['Inter', 'Georgia', 'Arial', 'Times New Roman', 'Courier New', 'Impact'];
const TEXT_COLORS = ['#000000', '#FFFFFF', '#C0392B', '#1A1A2E', '#D4A017', '#2D6A4F', '#7C3AED', '#DC2626'];
const POSITIONS = [
  { value: 'front', label: 'Отпред', icon: '◻' },
  { value: 'back', label: 'Отзад', icon: '◻' },
  { value: 'sleeve', label: 'Ръкав', icon: '◻' },
] as const;
const STEPS = ['Цвят & Размер', 'Дизайн', 'Текст', 'Преглед'];

export default function TshirtCustomizer({ product, onClose, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(product.available_sizes?.[0] || 'M');
  const [colorIdx, setColorIdx] = useState(0);
  const [position, setPosition] = useState<'front' | 'back' | 'sleeve'>('front');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [textColor, setTextColor] = useState('#000000');
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const colors: ProductColor[] = product.available_colors || [{ name: 'Бяла', hex: '#FFFFFF' }];
  const selectedColor = colors[colorIdx];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDone = () => {
    onDone({
      size,
      color: selectedColor,
      printPosition: position,
      uploadedImageUrl: uploadedImage || undefined,
      customText: customText || undefined,
      fontFamily,
      textColor,
      note: note || undefined,
    });
  };

  const tshirtBg = selectedColor.hex === '#FFFFFF' ? '#f5f5f5' : selectedColor.hex;
  const textPreviewColor = selectedColor.hex === '#FFFFFF' ? '#000000' : '#ffffff';

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div className="relative w-full sm:max-w-3xl max-h-[95vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="bg-[#1a1a2e] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Персонализирай тениска</h2>
            <p className="text-white/50 text-xs">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 min-w-[80px] py-3 text-xs font-semibold transition-all ${
                i === step
                  ? 'text-[#c0392b] border-b-2 border-[#c0392b]'
                  : i < step
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              {i < step ? <Check size={14} className="mx-auto mb-0.5" /> : <span className="block text-center">{i + 1}</span>}
              <span className="block text-center">{s}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Preview */}
          <div className="w-full sm:w-80 shrink-0 p-6 flex items-center justify-center bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100">
            <div className="relative">
              {/* T-shirt silhouette */}
              <div
                className="w-48 h-52 relative rounded-xl shadow-lg flex items-center justify-center transition-colors duration-300"
                style={{ backgroundColor: tshirtBg }}
              >
                {/* Collar */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-8 rounded-b-full border-t-0"
                  style={{ backgroundColor: tshirtBg, filter: 'brightness(0.9)' }}
                />
                {/* Sleeves */}
                <div
                  className="absolute top-2 -left-6 w-14 h-16 rounded-xl"
                  style={{ backgroundColor: tshirtBg, filter: 'brightness(0.9)' }}
                />
                <div
                  className="absolute top-2 -right-6 w-14 h-16 rounded-xl"
                  style={{ backgroundColor: tshirtBg, filter: 'brightness(0.9)' }}
                />

                {/* Print area */}
                {position === 'front' && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-28 h-24 flex flex-col items-center justify-center gap-1">
                    {uploadedImage && (
                      <img src={uploadedImage} alt="Upload" className="max-w-full max-h-14 object-contain" />
                    )}
                    {customText && (
                      <p
                        className="text-center text-xs font-bold leading-tight"
                        style={{ fontFamily, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                      >
                        {customText}
                      </p>
                    )}
                    {!uploadedImage && !customText && (
                      <div className="border-2 border-dashed border-gray-300/50 rounded-lg w-full h-full flex items-center justify-center">
                        <Eye size={16} style={{ color: textPreviewColor, opacity: 0.3 }} />
                      </div>
                    )}
                  </div>
                )}
                {position === 'back' && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center px-2">
                    <p className="text-xs opacity-40" style={{ color: textPreviewColor }}>← Отзад →</p>
                    {customText && (
                      <p className="text-xs font-bold mt-1" style={{ fontFamily, color: textColor }}>{customText}</p>
                    )}
                  </div>
                )}
                {position === 'sleeve' && (
                  <div className="absolute top-4 -left-4 rotate-[-90deg] text-center">
                    {customText && (
                      <p className="text-[9px] font-bold" style={{ fontFamily, color: textColor, whiteSpace: 'nowrap' }}>{customText}</p>
                    )}
                  </div>
                )}

                {/* Size badge */}
                <div className="absolute bottom-2 right-2 bg-black/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {size}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-2">Визуален преглед</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {step === 0 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3">Цвят</label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c, i) => (
                      <button
                        key={c.hex}
                        onClick={() => setColorIdx(i)}
                        title={c.name}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            i === colorIdx ? 'border-[#c0392b] scale-110 shadow-lg' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[10px] text-gray-500">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3">Размер</label>
                  <div className="flex flex-wrap gap-2">
                    {product.available_sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          size === s
                            ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a1a2e]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3">Позиция на щампата</label>
                  <div className="flex gap-2">
                    {POSITIONS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPosition(p.value)}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                          position === p.value
                            ? 'bg-[#c0392b] text-white border-[#c0392b]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#c0392b]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3 flex items-center gap-2">
                    <Upload size={15} className="text-[#c0392b]" /> Качете изображение / лого
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-[#c0392b] hover:bg-[#c0392b]/5 ${
                      uploadedImage ? 'border-green-400 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    {uploadedImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={uploadedImage} alt="Preview" className="max-h-32 object-contain" />
                        <p className="text-sm text-green-600 font-medium">Изображението е качено</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Премахни
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-1">Кликнете за да качите файл</p>
                        <p className="text-xs text-gray-400">PNG, JPG, SVG (до 5MB)</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Бележка към поръчката (по желание)</label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder="Напр: Искам логото да е 15x15 см в центъра..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                    <Type size={15} className="text-[#c0392b]" /> Вашият текст
                  </label>
                  <textarea
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    rows={2}
                    maxLength={100}
                    placeholder="Напр: Happy Birthday! 🎉"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b] resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{customText.length}/100</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Шрифт</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f}
                        onClick={() => setFontFamily(f)}
                        className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                          fontFamily === f
                            ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                        style={{ fontFamily: f }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                    <Palette size={15} className="text-[#c0392b]" /> Цвят на текста
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEXT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setTextColor(c)}
                        title={c}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          textColor === c ? 'border-gray-800 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200"
                      />
                      <span className="text-xs text-gray-400">Потребителски</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-semibold text-gray-900">Обобщение на поръчката</h3>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                  {[
                    ['Продукт', product.name],
                    ['Цвят', selectedColor.name],
                    ['Размер', size],
                    ['Позиция', POSITIONS.find(p => p.value === position)?.label || ''],
                    customText && ['Текст', customText],
                    customText && ['Шрифт', fontFamily],
                    uploadedImage && ['Изображение', 'Качено ✓'],
                    note && ['Бележка', note],
                  ].filter(Boolean).map((pair, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500">{(pair as string[])[0]}</span>
                      <span className="font-medium text-gray-900 max-w-[60%] text-right truncate">{(pair as string[])[1]}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                    <span>Цена</span>
                    <span className="text-[#c0392b]">{product.price.toFixed(2)} лв.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={16} />
            {step === 0 ? 'Затвори' : 'Назад'}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Напред <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleDone}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#c0392b] hover:bg-[#e74c3c] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <ShoppingCart size={16} /> Добави в количката
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
