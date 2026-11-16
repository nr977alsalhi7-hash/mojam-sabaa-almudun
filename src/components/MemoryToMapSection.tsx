import React from 'react';
import { PlaceEntry } from '../types/atlas';

interface MemoryToMapSectionProps {
  places: PlaceEntry[];
}

export const MemoryToMapSection: React.FC<MemoryToMapSectionProps> = ({ places }) => {
  const mappedCount = places.filter((p) => p.coordinates !== null).length;
  const unmappedCount = places.length - mappedCount;
  const directMatchCount = places.filter((p) => p.semanticLinkType === 'direct_match').length;
  const possibleLinkCount = places.filter((p) => p.semanticLinkType === 'possible_link').length;
  const noLinkCount = places.filter((p) => p.semanticLinkType === 'no_link').length;
  const localNarrativeCount = places.filter((p) => p.hasLocalNarrative).length;

  const stages = [
    {
      num: '01',
      title: 'التوثيق من الذاكرة المحلية والمصادر العُمانية',
      body: 'يبدأ المسار بجمع مادة المكان من الروايات الشفهية المتداولة وكتب التراث العُماني مثل «موسوعة أرض عُمان» و«تحفة الأعيان» و«المدن والقرى والقبائل»، مع الفصل الصارم بين الخبر التاريخي والرواية المحلية.',
    },
    {
      num: '02',
      title: 'التحقيق المعجمي واستخلاص الجذر اللغوي',
      body: 'تُردّ الأسماء إلى جذورها الثلاثية أو الرباعية في «لسان العرب» و«المعجم الوسيط» و«معجم البلدان» و«مقاييس اللغة»، وتُستحضر الشواهد الشعرية الموثقة دون إسقاط اشتقاقات متكلفة.',
    },
    {
      num: '03',
      title: 'التمييز المنهجي بين الدلالة المؤكدة والمحتملة',
      body: 'لا يُفترض أن كل اسم عربي الفصحى يحمل سبب تسمية المكان؛ بل يُميَّز بين المواضع ذات التطابق الدلالي المباشر، وتلك ذات التقارب المحتمل، والمواضع التي لم يثبت ارتباطها بالمعنى المعجمي.',
    },
    {
      num: '04',
      title: 'الإسقاط الجغرافي المنضبط على الخريطة',
      body: 'تُثبَّت العلامات على خريطة ولاية صحار المفتوحة فقط للمواقع التي أمكن التحقق من إحداثياتها بدقة، بينما تبقى المواضع التي تحتاج رصدًا ميدانيًا إضافيًا محفوظة في الموسوعة دون علامة تخمينية.',
    },
  ];

  return (
    <section
      id="methodology-section"
      className="py-16 lg:py-24 bg-[#FBF9F5] border-b border-[#D6CEBE]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold text-[#9E5633] tracking-wide">
            المنهجية العلمية والرقمية
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B253A]">
            من الذاكرة إلى الخريطة
          </h2>
          <p className="text-sm sm:text-base text-[#555E68] leading-relaxed">
            كيف تتحوّل الروايات الشفهية وأسماء القرى والأودية المتوارثة إلى معرفة رقمية موثقة
            تحفظ للأماكن العُمانية هويتها الجغرافية واللغوية دون تحريف أو تخمين؟
          </p>
        </div>

        {/* 4 Stages Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="bg-[#F3EFE6]/70 border border-[#D6CEBE] rounded-xl p-6 space-y-3"
            >
              <span className="font-mono-num text-sm font-semibold text-[#9E5633] block">
                {stage.num}
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#0B253A] leading-snug">
                {stage.title}
              </h3>
              <p className="text-sm text-[#555E68] leading-relaxed">{stage.body}</p>
            </div>
          ))}
        </div>

        {/* Live Epistemic Breakdown Bar */}
        <div className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <h3 className="font-editorial text-2xl font-bold text-[#0B253A]">
                ميزان التوثيق في قاعدة بيانات صحار
              </h3>
              <p className="text-sm text-[#555E68]">
                توزيع المواضع الخمسين بحسب درجة الربط المعجمي، وجود الرواية المحلية، وحالة الرصد
                الإحداثي.
              </p>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              <div>
                <dt className="text-xs text-[#555E68]">توافق دلالي مباشر</dt>
                <dd className="font-mono-num text-2xl font-bold text-[#0B253A] mt-1">
                  {directMatchCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#555E68]">تقارب محتمل</dt>
                <dd className="font-mono-num text-2xl font-bold text-[#9E5633] mt-1">
                  {possibleLinkCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#555E68]">لم يثبت ارتباطها</dt>
                <dd className="font-mono-num text-2xl font-bold text-[#555E68] mt-1">
                  {noLinkCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#555E68]">برواية محلية</dt>
                <dd className="font-mono-num text-2xl font-bold text-[#0B253A] mt-1">
                  {localNarrativeCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#555E68]">مرصودة / قيد الرصد</dt>
                <dd className="font-mono-num text-2xl font-bold text-[#0B253A] mt-1">
                  {mappedCount}
                  <span className="text-sm font-normal text-[#555E68]"> / {unmappedCount}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};
