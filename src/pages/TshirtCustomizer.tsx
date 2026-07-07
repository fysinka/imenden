import { useState, useRef, useCallback, MouseEvent } from 'react';
import { X, Upload, Type, Palette, Eye, ChevronLeft, ChevronRight, Check, Layers, Trash2, Plus, Move, Square, Circle, Triangle, Star, Heart, Zap, Sun, Moon, Cloud, Droplet, ShoppingCart } from 'lucide-react';
import { Product, TshirtCustomization, ProductColor } from '../types';

interface Props {
  product: Product;
  onClose: () => void;
  onDone: (customization: TshirtCustomization) => void;
}

interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  rotation?: number;
  opacity?: number;
}

const FONTS = ['Inter', 'Georgia', 'Arial', 'Impact', 'Courier New', 'Bebas Neue', 'Roboto Slab', 'Montserrat'];
const TEXT_COLORS = ['#000000', '#FFFFFF', '#C0392B', '#1A1A2E', '#D4A017', '#2D6A4F', '#7C3AED', '#DC2626', '#2563EB'];
const SHAPES = [
  { type: 'circle', label: 'Кръг', icon: Circle },
  { type: 'square', label: 'Квадрат', icon: Square },
  { type: 'triangle', label: 'Триъгълник', icon: Triangle },
  { type: 'star', label: 'Звезда', icon: Star },
  { type: 'heart', label: 'Сърце', icon: Heart },
  { type: 'zap', label: 'Мълния', icon: Zap },
  { type: 'sun', label: 'Слънце', icon: Sun },
  { type: 'moon', label: 'Луна', icon: Moon },
  { type: 'cloud', label: 'Облак', icon: Cloud },
];

const POSITIONS = [
  { value: 'front', label: 'Отпред' },
  { value: 'back', label: 'Отзад' },
] as const;

const STEPS = ['Цвят & Размер', 'Текст & Елементи', 'Изображение', 'Преглед'];

export default function TshirtCustomizer({ product, onClose, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(product.available_sizes?.[0] || 'M');
  const [colorIdx, setColorIdx] = useState(0);
  const [position, setPosition] = useState<'front' | 'back'>('front');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const tshirtRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // New text input state
  const [newText, setNewText] = useState('');
  const [newTextFont, setNewTextFont] = useState('Inter');
  const [newTextSize, setNewTextSize] = useState(24);
  const [newTextColor, setNewTextColor] = useState('#000000');

  // Shape customization
  const [newShapeColor, setNewShapeColor] = useState('#C0392B');
  const [newShapeSize, setNewShapeSize] = useState(40);

  const colors: ProductColor[] = product.available_colors || [{ name: 'Бяла', hex: '#FFFFFF' }];
  const selectedColor = colors[colorIdx];

  const selectedElement = elements.find(e => e.id === selectedElementId);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addTextElement = () => {
    if (!newText.trim()) return;

    const element: DesignElement = {
      id: generateId(),
      type: 'text',
      content: newText,
      x: 80,
      y: 80,
      fontSize: newTextSize,
      fontFamily: newTextFont,
      color: newTextColor,
      rotation: 0,
      opacity: 1,
    };

    setElements([...elements, element]);
    setSelectedElementId(element.id);
    setNewText('');
  };

  const addShapeElement = (shapeType: string) => {
    const element: DesignElement = {
      id: generateId(),
      type: 'shape',
      content: shapeType,
      x: 80,
      y: 80,
      width: newShapeSize,
      height: newShapeSize,
      color: newShapeColor,
      rotation: 0,
      opacity: 1,
    };

    setElements([...elements, element]);
    setSelectedElementId(element.id);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const element: DesignElement = {
        id: generateId(),
        type: 'image',
        content: ev.target?.result as string,
        x: 60,
        y: 60,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
      };
      setElements([...elements, element]);
      setSelectedElementId(element.id);
    };
    reader.readAsDataURL(file);
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(elements.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Drag handling
  const handleMouseDown = useCallback((e: MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    const element = elements.find(el => el.id === elementId);
    if (!element || !tshirtRef.current) return;

    const rect = tshirtRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - element.x;
    const y = e.clientY - rect.top - element.y;
    setDragOffset({ x, y });
    setIsDragging(true);
  }, [elements]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElementId || !tshirtRef.current) return;

    const rect = tshirtRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x;
    let y = e.clientY - rect.top - dragOffset.y;

    // Constrain to t-shirt bounds
    x = Math.max(0, Math.min(rect.width - 20, x));
    y = Math.max(0, Math.min(rect.height - 20, y));

    updateElement(selectedElementId, { x, y });
  }, [isDragging, selectedElementId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDone = () => {
    // Convert elements to customization format
    const textElements = elements.filter(e => e.type === 'text');
    const imageElements = elements.filter(e => e.type === 'image');
    const shapeElements = elements.filter(e => e.type === 'shape');

    onDone({
      size,
      color: selectedColor,
      printPosition: position,
      uploadedImageUrl: imageElements[0]?.content || undefined,
      customText: textElements.map(t => t.content).join(' | ') || undefined,
      fontFamily: textElements[0]?.fontFamily || 'Inter',
      textColor: textElements[0]?.color || '#000000',
      note: note || undefined,
      designElements: elements,
    });
  };

  const tshirtBg = selectedColor.hex === '#FFFFFF' ? '#f5f5f5' : selectedColor.hex;
  const contrastColor = selectedColor.hex === '#FFFFFF' || selectedColor.hex === '#FFF9F0' ? '#333' : '#fff';

  const renderShape = (element: DesignElement) => {
    const size = element.width || 40;
    const color = element.color || '#C0392B';
    const shape = SHAPES.find(s => s.type === element.content);
    const Icon = shape?.icon || Square;

    switch (element.content) {
      case 'circle':
        return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: '50%' }} />;
      case 'square':
        return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />;
      case 'triangle':
        return <div style={{ width: 0, height: 0, borderLeft: `${size/2}px solid transparent`, borderRight: `${size/2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />;
      case 'heart':
        return <Heart size={size} fill={color} color={color} />;
      case 'star':
        return <Star size={size} fill={color} color={color} />;
      case 'zap':
        return <Zap size={size} color={color} fill={color} />;
      case 'sun':
        return <Sun size={size} color={color} />;
      case 'moon':
        return <Moon size={size} color={color} />;
      case 'cloud':
        return <Cloud size={size} color={color} />;
      default:
        return <Icon size={size} color={color} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-4xl max-h-[95vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header */}
        <div className="bg-[#1a1a2e] px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Персонализирай {product.name}</h2>
            <p className="text-white/50 text-xs">Добавете текст, форми и изображения</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-gray-100 shrink-0">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 py-3 text-xs font-semibold transition-all ${
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
          <div
            ref={tshirtRef}
            className="w-full sm:w-96 shrink-0 p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border-b sm:border-b-0 sm:border-r border-gray-200 relative"
            style={{ minHeight: '350px' }}
          >
            <div className="relative">
              {/* T-shirt SVG */}
              <svg viewBox="0 0 200 220" className="w-52 h-56 drop-shadow-xl">
                {/* T-shirt body */}
                <path
                  d="M40 35 L10 60 L30 80 L30 200 L170 200 L170 80 L190 60 L160 35 L130 50 L100 45 L70 50 L40 35"
                  fill={tshirtBg}
                  stroke={selectedColor.hex === '#FFFFFF' ? '#ddd' : 'transparent'}
                  strokeWidth="1"
                />
                {/* Collar */}
                <ellipse cx="100" cy="42" rx="30" ry="12" fill={tshirtBg} style={{ filter: 'brightness(0.85)' }} />
              </svg>

              {/* Print area overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="relative"
                  style={{ width: '180px', height: '160px', marginTop: '-20px' }}
                >
                  {/* Elements */}
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move pointer-events-auto transition-shadow ${
                        selectedElementId === element.id ? 'ring-2 ring-[#c0392b] ring-offset-2' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        transform: `rotate(${element.rotation || 0}deg)`,
                        opacity: element.opacity || 1,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                    >
                      {element.type === 'text' && (
                        <p
                          className="whitespace-nowrap font-bold text-center"
                          style={{
                            fontSize: element.fontSize,
                            fontFamily: element.fontFamily,
                            color: element.color,
                            textShadow: selectedColor.hex === '#FFFFFF' ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                          }}
                        >
                          {element.content}
                        </p>
                      )}
                      {element.type === 'image' && (
                        <img
                          src={element.content}
                          alt="Design"
                          className="object-contain"
                          style={{ maxWidth: element.width || 80, maxHeight: element.height || 80 }}
                          draggable={false}
                        />
                      )}
                      {element.type === 'shape' && renderShape(element)}
                      {selectedElementId === element.id && (
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                          onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
                        >
                          <X size={12} className="text-white" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Size badge */}
              {size && (
                <div className="absolute bottom-3 right-3 bg-black/30 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                  {size}
                </div>
              )}
            </div>

            <p className="absolute bottom-3 left-3 text-xs text-gray-400 flex items-center gap-1">
              <Move size={12} /> Завлачете елементи за преместване
            </p>
          </div>

          {/* Controls */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {step === 0 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3">Цвят на тениската</label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c, i) => (
                      <button
                        key={c.hex}
                        onClick={() => setColorIdx(i)}
                        title={c.name}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 transition-all ${
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
                        className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
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
                        className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
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
              <div className="space-y-6 animate-fadeIn">
                {/* Add Text Section */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Type size={18} className="text-[#c0392b]" />
                    <h3 className="font-semibold text-gray-900">Добавете текст</h3>
                  </div>

                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Въведете текст..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c0392b]"
                    maxLength={50}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Шрифт</label>
                      <select
                        value={newTextFont}
                        onChange={(e) => setNewTextFont(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                      >
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Размер</label>
                      <select
                        value={newTextSize}
                        onChange={(e) => setNewTextSize(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                      >
                        {[12, 16, 20, 24, 32, 40, 48].map(s => <option key={s} value={s}>{s}px</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-2">Цвят</label>
                    <div className="flex flex-wrap gap-2">
                      {TEXT_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewTextColor(c)}
                          title={c}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            newTextColor === c ? 'border-gray-800 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={addTextElement}
                    disabled={!newText.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      newText.trim()
                        ? 'bg-[#c0392b] text-white hover:bg-[#e74c3c]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={16} /> Добавете текст
                  </button>
                </div>

                {/* Add Shapes Section */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-[#c0392b]" />
                    <h3 className="font-semibold text-gray-900">Добавете елементи</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SHAPES.map((shape) => {
                      const Icon = shape.icon;
                      return (
                        <button
                          key={shape.type}
                          onClick={() => addShapeElement(shape.type)}
                          title={shape.label}
                          className="w-12 h-12 rounded-xl border-2 border-gray-200 hover:border-[#c0392b] hover:bg-white flex items-center justify-center transition-all"
                        >
                          <Icon size={24} className="text-gray-600" />
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Размер</label>
                      <select
                        value={newShapeSize}
                        onChange={(e) => setNewShapeSize(Number(e.target.value))}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                      >
                        {[24, 32, 40, 48, 56, 64].map(s => <option key={s} value={s}>{s}px</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Цвят</label>
                      <div className="flex gap-1">
                        {['#C0392B', '#D4A017', '#2D6A4F', '#2563EB', '#7C3AED'].map(c => (
                          <button
                            key={c}
                            onClick={() => setNewShapeColor(c)}
                            className={`w-6 h-6 rounded-full border transition-all ${
                              newShapeColor === c ? 'border-gray-800' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Existing Elements List */}
                {elements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Елементи ({elements.length})</h3>
                    <div className="space-y-2">
                      {elements.map((el, i) => (
                        <div
                          key={el.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedElementId === el.id ? 'border-[#c0392b] bg-[#c0392b]/5' : 'border-gray-200 bg-white'
                          }`}
                          onClick={() => setSelectedElementId(el.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">#{i + 1}</span>
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {el.type === 'text' ? el.content : el.type === 'image' ? 'Изображение' : `Форма: ${el.content}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-3 flex items-center gap-2">
                    <Upload size={15} className="text-[#c0392b]" /> Качете изображение / лого
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-[#c0392b] hover:bg-[#c0392b]/5"
                  >
                    <Upload size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-1">Кликнете за да качите файл</p>
                    <p className="text-xs text-gray-400">PNG, JPG, SVG (до 5MB)</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>

                {elements.filter(e => e.type === 'image').length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700 mb-3">Качени изображения:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {elements.filter(e => e.type === 'image').map(el => (
                        <div key={el.id} className="relative group">
                          <img src={el.content} alt="Upload" className="w-full h-20 object-contain rounded-lg bg-white p-2" />
                          <button
                            onClick={() => deleteElement(el.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-semibold text-gray-900">Обобщение на поръчката</h3>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                  {[
                    ['Продукт', product.name],
                    ['Цвят', selectedColor.name],
                    ['Размер', size],
                    ['Позиция', position === 'front' ? 'Отпред' : 'Отзад'],
                    elements.length > 0 && ['Елементи', `${elements.filter(e => e.type === 'text').length} текст, ${elements.filter(e => e.type === 'shape').length} форми, ${elements.filter(e => e.type === 'image').length} изображ.`],
                    ...elements.filter(e => e.type === 'text').map((el, i) => [`Текст ${i+1}`, `"${el.content}"`]),
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

                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                  <strong>Важно:</strong> Окончателният дизайн ще бъде изпратен за потвърждение преди производство.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
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
              <Check size={16} /> Добави в количката
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
