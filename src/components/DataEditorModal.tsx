import React, { useState } from 'react';
import { Download, RotateCcw, Save, X } from 'lucide-react';
import { PlaceEntry } from '../types/atlas';

interface DataEditorModalProps {
  places: PlaceEntry[];
  initialPlace?: PlaceEntry;
  onSavePlace: (updated: PlaceEntry) => void;
  onResetAll: () => void;
  onClose: () => void;
}

export const DataEditorModal: React.FC<DataEditorModalProps> = ({
  places,
  initialPlace,
  onSavePlace,
  onResetAll,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialPlace?.id || places[0]?.id || ''
  );

  const current = places.find((p) => p.id === selectedId) || places[0];

  const [latInput, setLatInput] = useState<string>(
    current?.coordinates ? String(current.coordinates[0]) : ''
  );
  const [lngInput, setLngInput] = useState<string>(
    current?.coordinates ? String(current.coordinates[1]) : ''
  );
  const [coordNote, setCoordNote] = useState<string>(current?.coordinateNote || '');
  const [addition, setAddition] = useState<string>(current?.researcherAddition || '');
  const [histContext, setHistContext] = useState<string>(
    current?.historicalContext || ''
  );
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSelectChange = (newId: string) => {
    setSelectedId(newId);
    const target = places.find((p) => p.id === newId);
    if (target) {
      setLatInput(target.coordinates ? String(target.coordinates[0]) : '');
      setLngInput(target.coordinates ? String(target.coordinates[1]) : '');
      setCoordNote(target.coordinateNote);
      setAddition(target.researcherAddition || '');
      setHistContext(target.historicalContext);
      setSavedNotice(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    const hasValidCoords =
      latInput.trim() !== '' &&
      lngInput.trim() !== '' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      lat >= 23.5 &&
      lat <= 25.0 &&
      lng >= 55.8 &&
      lng <= 57.2;

    if ((latInput.trim() !== '' || lngInput.trim() !== '') && !hasValidCoords) {
      setSavedNotice('يرجى إدخال إحداثيات صالحة ضمن نطاق ولاية صحار (خط العرض 23.5–25.0، خط الطول 55.8–57.2).');
      return;
    }

    onSavePlace({
      ...current,
      coordinates: hasValidCoords ? [lat, lng] : null,
      coordinateNote:
        coordNote.trim() ||
        (hasValidCoords
          ? 'إحداثيات مضافة ومحققة عبر محرر مُعجم سبع المدن'
          : 'معروضة في الموسوعة — بانتظار التوثيق الإحداثي الدقيق'),
      historicalContext: histContext.trim() || current.historicalContext,
      researcherAddition: addition.trim() || undefined,
    });

    setSavedNotice('تم حفظ التعديلات محليًا وتحديث الخريطة والموسوعة.');
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(places, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mujam-sabaa-almudun-sohar.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B253A]/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="محرر بيانات مُعجم سبع المدن"
    >
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-5 border-b border-[#D6CEBE] flex items-center justify-between gap-4 bg-[#F3EFE6]">
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#0B253A]">
              تحرير وإثراء بيانات مُعجم سبع المدن
            </h2>
            <p className="text-xs text-[#555E68] mt-0.5">
              بيانات منظمة قابلة للتعديل — لإضافة الإحداثيات المحققة أو استكمال الفراغات المصدرية
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555E68] hover:text-[#0B253A] hover:bg-[#D6CEBE]/40 cursor-pointer"
            aria-label="إغلاق المحرر"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#0B253A] mb-1.5">
              اختر الموضع المراد تحديثه
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg text-[#0B253A] focus:outline-none focus:border-[#0B253A]"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.typeLabel}) {p.coordinates ? '— مرصود' : '— دون إحداثي'}
                </option>
              ))}
            </select>
          </div>

          {current?.incompleteSourceNote && (
            <div className="p-3.5 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg text-xs text-[#9E5633]">
              <strong>معلومة ناقصة في المصدر:</strong> {current.incompleteSourceNote}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B253A] mb-1.5">
                خط العرض (Latitude)
              </label>
              <input
                type="text"
                dir="ltr"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="مثال: 24.3622"
                className="w-full px-3 py-2 text-sm font-mono-num bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#0B253A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0B253A] mb-1.5">
                خط الطول (Longitude)
              </label>
              <input
                type="text"
                dir="ltr"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="مثال: 56.7478"
                className="w-full px-3 py-2 text-sm font-mono-num bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#0B253A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B253A] mb-1.5">
              توثيق الحالة الإحداثية
            </label>
            <input
              type="text"
              value={coordNote}
              onChange={(e) => setCoordNote(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#0B253A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B253A] mb-1.5">
              السياق التاريخي والجغرافي (من المصدر)
            </label>
            <textarea
              rows={3}
              value={histContext}
              onChange={(e) => setHistContext(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#0B253A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B253A] mb-1.5">
              إضافة توثيقية أو استكمال ميداني لاحق
            </label>
            <textarea
              rows={2}
              value={addition}
              onChange={(e) => setAddition(e.target.value)}
              placeholder="أضف هنا أي سنة تاريخية، أو اتجاه جغرافي، أو توثيق ميداني موثوق..."
              className="w-full px-3 py-2 text-sm bg-[#F3EFE6]/60 border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#0B253A]"
            />
          </div>

          {savedNotice && (
            <p className="text-xs font-medium text-[#0B253A] bg-[#C59B57]/20 px-3 py-2 rounded-lg">
              {savedNotice}
            </p>
          )}

          <div className="pt-3 border-t border-[#D6CEBE] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F3EFE6] hover:bg-[#EBE6DF] text-[#0B253A] border border-[#D6CEBE] rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير JSON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setSavedNotice('تمت استعادة البيانات الأصلية من المصدر.');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#9E5633] hover:bg-[#F3EFE6] rounded-lg cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الأصل</span>
              </button>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#0B253A] hover:bg-[#143A57] text-[#FBF9F5] rounded-lg cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#D6B478]" />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
