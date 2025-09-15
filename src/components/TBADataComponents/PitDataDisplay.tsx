import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Map, AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hasStoredNexusTeams } from '@/lib/nexusUtils';
import type { NexusPitAddresses, NexusPitMap } from '@/lib/nexusUtils';
import { toast } from 'sonner';

interface PitDataDisplayProps {
  addresses: NexusPitAddresses | null;
  map: NexusPitMap | null;
  eventKey: string;
}

export const PitDataDisplay: React.FC<PitDataDisplayProps> = ({
  addresses,
  map,
  eventKey
}) => {
  const addressCount = addresses ? Object.keys(addresses).length : 0;
  const hasMap = map !== null;
  const hasExtractedTeams = hasStoredNexusTeams(eventKey);

  // --- small additions for map rendering preview ---
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingRender, setLoadingRender] = useState(false);

  useEffect(() => {
    // revoke blob URL when component unmounts or when previewUrl changes
    return () => {
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch (_) {}
      }
    };
  }, [previewUrl]);

  async function handleRenderClick() {
    if (!map) return;
    setLoadingRender(true);
    try {
      // pass the map in a structure acceptable to the renderer (it handles several shapes)
      const blob = await renderMapToPNGBlob({ map: { value: map } }, { scale: 1 });
      const url = URL.createObjectURL(blob);
      // revoke previous if present
      if (previewUrl) {
        try { URL.revokeObjectURL(previewUrl); } catch (_) {}
      }
      setPreviewUrl(url);
      const renderMapButton = document.getElementById("render-map-button");
      if (renderMapButton) {
        renderMapButton.className = "'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90'";
      }
    } catch (err: any) {
      console.error('renderMapToPNGBlob failed', err);
      // minimal UI-safe feedback
      toast.error('Failed to render map: ' + (err?.message ?? String(err)));
    } finally {
      setLoadingRender(false);
    }
  }
  // ---------------------------------------------------

  if (!addresses && !map) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No pit data available. Load pit data using the Nexus API above.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pit Data for {eventKey}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={addressCount > 0 ? "default" : "secondary"}>
                {addressCount} Pit Addresses
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasMap ? "default" : "secondary"}>
                {hasMap ? "Pit Map Available" : "No Pit Map"}
              </Badge>
            </div>
            {hasExtractedTeams && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Users className="h-3 w-3 mr-1" />
                  Teams Extracted for Pit Assignments
                </Badge>
              </div>
            )}
          </div>
          {hasExtractedTeams && (
            <p className="text-xs text-muted-foreground mt-2">
              Team list automatically extracted from pit addresses and stored for pit scouting assignments
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pit Addresses */}
      {addresses && addressCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pit Addresses ({addressCount} teams)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.entries(addresses)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([teamNumber, pitAddress]) => (
                  <div 
                    key={teamNumber}
                    className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                  >
                    <span className="font-medium">Team {teamNumber}</span>
                    <Badge variant="outline" className="text-xs">
                      {pitAddress}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pit Map */}
      {map && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Pit Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Map Size: {map.size?.width || 0} × {map.size?.height || 0}</span>
                <span>Pits: {map.pits ? Object.keys(map.pits).length : 0}</span>
                {map.areas && <span>Areas: {Object.keys(map.areas).length}</span>}
              </div>
              
              {/* Simple text representation - could be enhanced with actual map rendering */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Pit map data loaded successfully. This contains:
                </p>
                <ul className="text-sm space-y-1">
                  {map.pits && <li>• {Object.keys(map.pits).length} pit locations</li>}
                  {map.areas && <li>• {Object.keys(map.areas).length} labeled areas</li>}
                  {map.walls && <li>• {Object.keys(map.walls).length} walls/boundaries</li>}
                  {map.labels && <li>• {Object.keys(map.labels).length} text labels</li>}
                  {map.arrows && <li>• {Object.keys(map.arrows).length} directional arrows</li>}
                </ul>
                {/* <p className="text-xs text-muted-foreground mt-3">
                  Visual map rendering will be available in a future update.
                </p> */}

                {/* --- Map Rendering Preview --- */}
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <button
                      id="render-map-button"
                      className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90"
                      onClick={handleRenderClick}
                      disabled={loadingRender}
                      // className="inline-flex items-center px-3 py-1 rounded bg-muted text-sm"
                    >
                      {loadingRender ? 'Rendering...' : 'Render Map Preview'}
                    </button>
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        download={`pit-map-${eventKey}.png`}
                        className="text-sm underline"
                      >
                        Download PNG
                      </a>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-3">
                      <img src={previewUrl} alt="Pit map preview" className="max-w-full rounded shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------------
   renderMapToPNGBlob
   - Integrated without changing original logic (TypeScript-annotated)
   - This function relies on browser DOM APIs and should be invoked client-side
----------------------------------------------------------------------------------*/
export async function renderMapToPNGBlob(data: any, opts: any = {}): Promise<Blob> {
  opts = Object.assign({ background: '#ffffff', borderColor: '#000000', scale: 1 }, opts);

  // locate map object (support both data.map.value and data.map)
  let mapObj: any = null;
  if (data && data.map) {
    mapObj = data.map.value ?? data.map;
  } else if (data && data.value && data.value.map) {
    mapObj = data.value.map; // fallback
  } else {
    throw new Error('map not found in provided data');
  }
  if (!mapObj.size) throw new Error('map.size missing');

  // support both size.x/size.y and size.width/size.height (convert to x/y if necessary)
  if (mapObj.size.width !== undefined && mapObj.size.height !== undefined && mapObj.size.x === undefined) {
    mapObj.size.x = mapObj.size.width;
    mapObj.size.y = mapObj.size.height;
  }

  const W = Math.round(mapObj.size.x * (opts.scale || 1));
  const H = Math.round(mapObj.size.y * (opts.scale || 1));

  // create HiDPI canvas
  const DPR = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.width = (W) + 'px';
  canvas.style.height = (H) + 'px';
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // scale drawing operations for DPR

  // background
  ctx.fillStyle = opts.background;
  ctx.fillRect(0, 0, W, H);

  // boundary
  ctx.lineWidth = 1;
  ctx.strokeStyle = opts.borderColor;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // helper: draw rectangle by center, optional rotation (degrees)
  function drawRectCenter(x: number, y: number, w: number, h: number, { fill = false, stroke = true, angle = 0 } = {}) {
    if (!ctx) throw new Error('Could not get canvas 2D context');
    ctx.save();
    ctx.translate(x, y);
    if (angle) ctx.rotate((angle * Math.PI) / 180);
    const lx = -w / 2;
    const ly = -h / 2;
    if (fill) {
      ctx.fillRect(lx, ly, w, h);
    }
    if (stroke) {
      ctx.strokeRect(lx, ly, w, h);
    }
    ctx.restore();
  }

  // helper: center text in rect; tries to reduce font if it overflows
  function drawCenteredText(text: string, x: number, y: number, w: number, h: number, optsText: any = {}) {
    if (!ctx) throw new Error('Could not get canvas 2D context');
    optsText = Object.assign({ fontFamily: 'Arial, sans-serif', fontSize: 14, color: '#000' }, optsText);
    ctx.fillStyle = optsText.color;
    // try reducing font size to fit
    let fontSize = optsText.fontSize;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    while (fontSize >= 6) {
      ctx.font = `${fontSize}px ${optsText.fontFamily}`;
      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = fontSize; // approximate
      if (textW <= w - 8 && textH <= h - 6) break;
      fontSize -= 1;
    }
    ctx.font = `${fontSize}px ${optsText.fontFamily}`;
    ctx.fillText(text, x, y);
  }

  // draw areas (prominent)
  if (mapObj.areas) {
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    for (const [areaId, area] of Object.entries(mapObj.areas)) {
      const areaObj = area as { position?: any; size?: any; label?: string };
      const pos: any = areaObj.position || {};
      const size: any = areaObj.size || { x: 50, y: 50 };
      drawRectCenter(pos.x, pos.y, size.x, size.y, { stroke: true });
      if (areaObj.label) {
        ctx.fillStyle = '#111';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(areaObj.label, pos.x, pos.y - (size.y / 2) - 6);
      }
      // draw area id small
      ctx.fillStyle = '#222';
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(areaId, pos.x - size.x / 2 + 4, pos.y - size.y / 2 + 4);
    }
  }

  // draw labels (small boxes with text)
  if (mapObj.labels) {
    ctx.lineWidth = 1;
    for (const [labelId, lab] of Object.entries(mapObj.labels)) {
      const labelObj = lab as { position?: any; size?: any; label?: string };
      const pos: any = labelObj.position || {};
      const size: any = labelObj.size || { x: 40, y: 40 };
      drawRectCenter(pos.x, pos.y, size.x, size.y, { stroke: true });
      if (labelObj.label) {
        // place label below the small box
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(labelObj.label, pos.x, pos.y + size.y / 2 + 6);
      }
      // id
      ctx.fillStyle = '#333';
      ctx.font = '9px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(labelId, pos.x - size.x / 2 + 4, pos.y - size.y / 2 + 4);
    }
  }

  // draw pits and put team numbers from pit data (or fallback to pit id)
  if (mapObj.pits) {
    ctx.lineWidth = 1;
    for (const [pitId, pit] of Object.entries(mapObj.pits)) {
      const pos: any = (pit as any).position || {};
      const size: any = (pit as any).size || { x: 80, y: 80 };
      const angle = (pit as any).angle ?? 0;

      // rectangle (stroke)
      ctx.save();
      ctx.translate(pos.x, pos.y);
      if (angle) ctx.rotate((angle * Math.PI) / 180);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(-size.x / 2, -size.y / 2, size.x, size.y);

      // attempt to find team number/label in common fields
      const candidateKeys = ['team', 'teamNumber', 'team_number', 'number', 'label', 'teamNum', 'teamNo', 'team_id'];
      let teamText: string | null = null;
      for (const k of candidateKeys) {
        if ((pit as any)[k] !== undefined && (pit as any)[k] !== null && String((pit as any)[k]).trim() !== '') {
          teamText = String((pit as any)[k]);
          break;
        }
      }
      // if pit contains nested 'team' object with number
      if (!teamText && (pit as any).team && typeof (pit as any).team === 'object') {
        const nestedKeys = ['number', 'teamNumber', 'team_id'];
        for (const k of nestedKeys) {
          if ((pit as any).team[k]) { teamText = String((pit as any).team[k]); break; }
        }
      }
      // fallback to pit id
      if (!teamText) teamText = pitId as string;

      // draw team text centered inside pit
      // rotate context back to neutral for simpler text placement if rotated
      ctx.restore();
      // use helper to handle font-size shrink
      drawCenteredText(teamText, pos.x, pos.y, size.x, size.y, { fontSize: 14, fontFamily: 'Arial', color: '#000' });

      // draw small pit id in corner (if teamText is not the id)
      if (teamText !== pitId) {
        ctx.fillStyle = '#444';
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(pitId, pos.x - size.x / 2 + 4, pos.y - size.y / 2 + 4);
      }

      // if rotated, draw rotated rect's border label (re-draw border rotated)
      if (angle) {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-size.x / 2, -size.y / 2, size.x, size.y);
        ctx.restore();
      }
    }
  }

  // signature / timestamp in corner
  ctx.fillStyle = '#666';
  ctx.font = '10px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`Rendered ${new Date().toLocaleString()}`, W - 6, H - 6);

  // return blob
  return await new Promise((resolve, reject) => {
    // toBlob may be asynchronous; handle possible null result by falling back to dataURL
    canvas.toBlob((blob) => {
      if (blob) return resolve(blob);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        // convert base64 to blob
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        resolve(new Blob([u8arr], { type: mime }));
      } catch (e) {
        reject(e);
      }
    }, 'image/png');
  });
}
