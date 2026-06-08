'use client';

import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import type { ProvinceData } from '@/types/lens';
import { CHART_COLORS, CHART_SENTIMENT, CHART_GRID } from '@/lib/chart-theme';

// Serve from public folder
const GEO_URL = '/indonesia-provinces.json';

// Map from GeoJSON Propinsi names to our data province names
const NAME_MAP: Record<string, string> = {
  'DKI JAKARTA': 'DKI Jakarta',
  'JAWA BARAT': 'Jawa Barat',
  'JAWA TIMUR': 'Jawa Timur',
  'JAWA TENGAH': 'Jawa Tengah',
  'BALI': 'Bali',
  'SUMATERA UTARA': 'Sumatera Utara',
  'SULAWESI SELATAN': 'Sulawesi Selatan',
  'KALIMANTAN TIMUR': 'Kalimantan Timur',
  'SUMATERA BARAT': 'Sumatera Barat',
  'PROBANTEN': 'Banten',
  'DAERAH ISTIMEWA YOGYAKARTA': 'Yogyakarta',
  'RIAU': 'Riau',
  'LAMPUNG': 'Lampung',
  'KALIMANTAN SELATAN': 'Kalimantan Selatan',
  'SUMATERA SELATAN': 'Sumatera Selatan',
  'NUSATENGGARA BARAT': 'Nusa Tenggara Barat',
  'NUSA TENGGARA TIMUR': 'Nusa Tenggara Timur',
  'IRIAN JAYA TIMUR': 'Papua',
  'KALIMANTAN BARAT': 'Kalimantan Barat',
  'SULAWESI UTARA': 'Sulawesi Utara',
  'MALUKU': 'Maluku',
  'DI. ACEH': 'Aceh',
  'BENGKULU': 'Bengkulu',
  'JAMBI': 'Jambi',
  'BANGKA BELITUNG': 'Bangka Belitung',
  'GORONTALO': 'Gorontalo',
  'SULAWESI TENGAH': 'Sulawesi Tengah',
  'SULAWESI TENGGARA': 'Sulawesi Tenggara',
  'KALIMANTAN TENGAH': 'Kalimantan Tengah',
  'MALUKU UTARA': 'Maluku Utara',
  'IRIAN JAYA BARAT': 'Papua Barat',
  'IRIAN JAYA TENGAH': 'Papua',
  'KEPULAUAN RIAU': 'Kepulauan Riau',
};

function getSentimentColor(value: number): string {
  if (value >= 0.1) return CHART_SENTIMENT.positive;
  if (value >= -0.1) return CHART_SENTIMENT.neutral;
  return CHART_SENTIMENT.negative;
}

export default function GeoMap({ data }: { data: ProvinceData[] }) {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const provinceMap = useMemo(() => {
    const map: Record<string, { sentiment: number; mentions: number }> = {};
    data.forEach((p) => {
      map[p.name] = { sentiment: p.sentiment, mentions: p.mentions };
    });
    return map;
  }, [data]);

  const findProvince = (geoName: string) => {
    const mapped = NAME_MAP[geoName];
    if (mapped && provinceMap[mapped]) {
      return { ...provinceMap[mapped], name: mapped };
    }
    // Fallback: try partial matching
    for (const key of Object.keys(provinceMap)) {
      if (geoName.toUpperCase().includes(key.toUpperCase()) || key.toUpperCase().includes(geoName.toUpperCase())) {
        return { ...provinceMap[key], name: key };
      }
    }
    return null;
  };

  return (
    <div className="card p-4">
      <h3 className="text-sm font-display font-semibold text-lens-text mb-4">Indonesia Sentiment Map</h3>
      <div className="relative" onMouseLeave={() => setTooltipContent('')}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [118, -2.5], scale: 1100 }}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  const geoName = geo.properties?.Propinsi || geo.properties?.name || geo.properties?.NAME_1 || '';
                  const province = findProvince(geoName);
                  const sentiment = province?.sentiment || 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getSentimentColor(sentiment)}
                      stroke={CHART_GRID.stroke}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none', opacity: 0.85 },
                        hover: { outline: 'none', opacity: 1, fill: CHART_COLORS.primary },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={() => {
                        const display = province
                          ? `${province.name}: ${province.mentions.toLocaleString()} mentions (${province.sentiment > 0 ? '+' : ''}${(province.sentiment * 100).toFixed(0)}%)`
                          : geoName;
                        setTooltipContent(display);
                      }}
                      onMouseMove={(e: React.MouseEvent) => {
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => setTooltipContent('')}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltipContent && (
          <div
            className="fixed bg-card border border-lens-border rounded-lg px-3 py-2 shadow-xl text-xs text-lens-text pointer-events-none z-50"
            style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 10 }}
          >
            {tooltipContent}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="text-[10px] text-lens-text-muted">Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-foreground-soft" />
            <span className="text-[10px] text-lens-text-muted">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-400" />
            <span className="text-[10px] text-lens-text-muted">Positive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
