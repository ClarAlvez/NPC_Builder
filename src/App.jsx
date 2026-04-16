import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Save,
  FileDown,
  Plus,
  Trash2,
  Sparkles,
  ImagePlus,
  BookOpen,
  WandSparkles,
  StickyNote,
  Shield,
  Heart,
  Brain,
  Zap,
  ChevronRight,
  Check,
} from 'lucide-react';

const STORAGE_KEY = 'ordem-npc-builder-sheets';
const elementOptions = ['Sangue', 'Morte', 'Energia', 'Conhecimento', 'Medo'];

const createEmptyNpc = () => ({
  id: crypto.randomUUID(),
  nome: '',
  equipe: '',
  origem: '',
  classe: '',
  trilha: '',
  nex: '0',
  elementoPrincipal: 'Sangue',
  elementosSecundarios: [],
  percepcao: '',
  iniciativa: '',
  defesa: '',
  fortitude: '',
  reflexos: '',
  vontade: '',
  pv: '',
  pvAtual: '',
  pe: '',
  peAtual: '',
  sanidade: '',
  sanidadeAtual: '',
  deslocamento: '',
  resistencias: '',
  vulnerabilidades: '',
  imunidades: '',
  pericias: '',
  aparencia: '',
  anotacoesGerais: '',
  historia: '',
  informacoesGerais: '',
  itensNotas: '',
  habilidadesNotas: '',
  rituaisNotas: '',
  imagem: '',
  ataques: [
    { nome: '', teste: '', dano: '', extra: '' },
    { nome: '', teste: '', dano: '', extra: '' },
    { nome: '', teste: '', dano: '', extra: '' },
    { nome: '', teste: '', dano: '', extra: '' },
  ],
  habilidades: [{ nome: '', descricao: '' }],
  itens: [{ nome: '', descricao: '' }],
  rituais: [{ nome: '', descricao: '' }],
  agi: 0,
  forca: 0,
  int: 0,
  pre: 0,
  vig: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const labelStyle = 'text-xs uppercase tracking-[0.24em] text-zinc-400';
const inputStyle = 'w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500';
const textareaStyle = `${inputStyle} min-h-[96px] resize-y`;
const tabButtonStyle = 'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition';

function SectionTitle({ children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-zinc-800" />
      <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300">{children}</h3>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <label className="space-y-2">
      <div className={labelStyle}>{label}</div>
      <input type={type} className={inputStyle} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function TextBlock({ label, value, onChange, placeholder = '', rows = 5 }) {
  return (
    <label className="space-y-2">
      <div className={labelStyle}>{label}</div>
      <textarea className={textareaStyle} rows={rows} value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

function HexStat({ label, value }) {
  const display = Number(value) || 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-800">{label}</div>
      <div className="relative h-12 w-12">
        <div
          className="absolute inset-0 border-2 border-zinc-900 bg-white"
          style={{ clipPath: 'polygon(25% 6%, 75% 6%, 96% 50%, 75% 94%, 25% 94%, 4% 50%)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-base font-black text-zinc-900">{display}</div>
      </div>
    </div>
  );
}

function LineBox({ title, children, className = '' }) {
  return (
    <div className={`rounded-[20px] border-2 border-zinc-900 bg-white p-3 flex flex-col ${className}`}>
      <div className="mb-2 self-start bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white rounded-md shrink-0">{title}</div>
      <div className="flex-1 w-full overflow-hidden">{children}</div>
    </div>
  );
}

function ComplexList({ items, emptyText = '—' }) {
  const valid = items.filter(item => {
    const name = typeof item === 'string' ? item : item.nome;
    return name && name.trim();
  });

  if (!valid.length) {
    return <div className="text-[12px] text-zinc-500 italic">{emptyText}</div>;
  }

  return (
    <div className="space-y-4 text-[12px] leading-relaxed">
      {valid.map((item, i) => {
        const obj = typeof item === 'string' ? { nome: item, descricao: '' } : item;
        return (
          <div key={i} className="border-b border-zinc-300 pb-3 last:border-0">
            <div className="font-bold text-[13px] uppercase tracking-wider text-zinc-900">{obj.nome}</div>
            {obj.descricao && <div className="mt-1 whitespace-pre-wrap text-zinc-800">{obj.descricao}</div>}
          </div>
        );
      })}
    </div>
  );
}

function StatQuickAdjust({ icon: Icon, label, current, max, onAdjust }) {
  return (
    <div className="rounded-[22px] border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-zinc-300">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.24em]">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">{current || '0'}<span className="text-sm text-zinc-500">/{max || '0'}</span></div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onAdjust(-1)} className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm font-bold hover:border-zinc-500">-1</button>
        <button onClick={() => onAdjust(1)} className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm font-bold hover:border-zinc-500">+1</button>
      </div>
    </div>
  );
}

function NpcCard({ npc, isActive, onSelect, onAdjust }) {
  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleCardKeyDown}
      className={`w-full cursor-pointer rounded-[24px] border p-4 text-left transition ${
        isActive ? 'border-zinc-500 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shrink-0">
          {npc.imagem ? (
            <img
              src={npc.imagem}
              alt={npc.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.24em] text-zinc-500 text-center leading-tight">
              Sem<br/>imagem
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate text-lg font-black text-white">
              {npc.nome || 'NPC sem nome'}
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
          </div>

          <div className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-400 truncate">
            {npc.classe || 'Classe'} • {npc.trilha || 'Trilha'} • {npc.nex || '0'}%
          </div>

          <div className="mt-2 text-xs text-zinc-500 truncate">
            {npc.equipe || 'Sem equipe'} • {npc.elementoPrincipal || 'Sem elemento principal'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-zinc-800 px-2 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">PV</div>
          <div className="mt-1 text-sm font-black text-white">
            {npc.pvAtual || '0'}/{npc.pv || '0'}
          </div>
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust('pvAtual', -1);
              }}
              className="flex-1 rounded-lg border border-zinc-700 py-1 text-xs"
            >
              -
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust('pvAtual', 1);
              }}
              className="flex-1 rounded-lg border border-zinc-700 py-1 text-xs"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 px-2 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">PE</div>
          <div className="mt-1 text-sm font-black text-white">
            {npc.peAtual || '0'}/{npc.pe || '0'}
          </div>
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust('peAtual', -1);
              }}
              className="flex-1 rounded-lg border border-zinc-700 py-1 text-xs"
            >
              -
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust('peAtual', 1);
              }}
              className="flex-1 rounded-lg border border-zinc-700 py-1 text-xs"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 px-2 py-2">
          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">SAN</div>
          <div className="mt-1 text-sm font-black text-white">
            {npc.sanidadeAtual || '0'}/{npc.sanidade || '0'}
          </div>
          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust('sanidadeAtual', -1);
              }}
              className="flex-1 rounded-lg border border-zinc-700 py-1 text-xs"
            >
              -
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdjust('sanidadeAtual', 1);
              }}
              className="flex-1 rounded-lg border border-zinc-700 py-1 text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecondaryElementPicker({ selected, onToggle }) {
  return (
    <div className="space-y-2">
      <div className={labelStyle}>Elementos secundários</div>
      <div className="flex flex-wrap gap-2">
        {elementOptions.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                active ? 'border-white bg-white text-black' : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <Check className="h-4 w-4" /> {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [npcs, setNpcs] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [createEmptyNpc()];
    try {
      const parsed = JSON.parse(raw);
      return parsed.length ? parsed : [createEmptyNpc()];
    } catch {
      return [createEmptyNpc()];
    }
  });
  const [activeNpcId, setActiveNpcId] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed[0]?.id || null;
    } catch {
      return null;
    }
  });
  const [savedMessage, setSavedMessage] = useState('');
  const [formTab, setFormTab] = useState('gerais');
  
  const pdfPageGeneralRef = useRef(null);
  const pdfPageHabilidadesRef = useRef(null);
  const pdfPageRituaisRef = useRef(null);
  const pdfPageInformacoesRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(npcs));
  }, [npcs]);

  useEffect(() => {
    if (!activeNpcId && npcs[0]) setActiveNpcId(npcs[0].id);
  }, [activeNpcId, npcs]);

  const data = useMemo(() => npcs.find((npc) => npc.id === activeNpcId) || npcs[0], [npcs, activeNpcId]);

  const updateNpc = (updater) => {
    setNpcs((prev) =>
      prev.map((npc) => {
        if (npc.id !== (activeNpcId || prev[0]?.id)) return npc;
        const updated = typeof updater === 'function' ? updater(npc) : { ...npc, ...updater };
        return { ...updated, updatedAt: Date.now() };
      })
    );
  };

  const handleChange = (field, value) => {
    updateNpc((npc) => ({ ...npc, [field]: value }));
  };

  const toggleSecondaryElement = (element) => {
    updateNpc((npc) => ({
      ...npc,
      elementosSecundarios: npc.elementosSecundarios.includes(element)
        ? npc.elementosSecundarios.filter((item) => item !== element)
        : [...npc.elementosSecundarios, element],
    }));
  };

  const handleAttackChange = (index, field, value) => {
    updateNpc((npc) => ({
      ...npc,
      ataques: npc.ataques.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleComplexItemChange = (listName, index, field, value) => {
    updateNpc((npc) => {
      const newList = npc[listName].map((item, i) => {
        if (i !== index) return typeof item === 'string' ? { nome: item, descricao: '' } : item;
        const current = typeof item === 'string' ? { nome: item, descricao: '' } : item;
        return { ...current, [field]: value };
      });
      return { ...npc, [listName]: newList };
    });
  };

  const addComplexItem = (listName) => {
    updateNpc((npc) => ({
      ...npc,
      [listName]: [...(npc[listName] || []), { nome: '', descricao: '' }]
    }));
  };

  const removeListItem = (field, index) => {
    updateNpc((npc) => ({ ...npc, [field]: npc[field].filter((_, i) => i !== index) }));
  };

  const saveAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(npcs));
    setSavedMessage('Fichas salvas diretamente na plataforma');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  const createNpc = () => {
    const fresh = createEmptyNpc();
    setNpcs((prev) => [fresh, ...prev]);
    setActiveNpcId(fresh.id);
    setSavedMessage('Nova ficha criada');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  const duplicateNpc = () => {
    if (!data) return;
    const copy = {
      ...data,
      id: crypto.randomUUID(),
      nome: data.nome ? `${data.nome} (cópia)` : 'NPC (cópia)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNpcs((prev) => [copy, ...prev]);
    setActiveNpcId(copy.id);
  };

  const deleteNpc = () => {
    if (npcs.length === 1) {
      setNpcs([createEmptyNpc()]);
      setActiveNpcId(null);
      return;
    }
    const filtered = npcs.filter((npc) => npc.id !== data.id);
    setNpcs(filtered);
    setActiveNpcId(filtered[0]?.id || null);
  };

  const adjustStat = (field, delta, npcId = data?.id) => {
    setNpcs((prev) =>
      prev.map((npc) => {
        if (npc.id !== npcId) return npc;
        const maxField = field === 'pvAtual' ? 'pv' : field === 'peAtual' ? 'pe' : 'sanidade';
        const maxValue = Number(npc[maxField] || 0);
        const current = Number(npc[field] || 0);
        const next = Math.max(0, maxValue ? Math.min(maxValue, current + delta) : current + delta);
        return { ...npc, [field]: String(next), updatedAt: Date.now() };
      })
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleChange('imagem', String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const [isExporting, setIsExporting] = useState(false);

  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  };

  const normalizePdfColors = (doc) => {
    const elements = Array.from(doc.querySelectorAll('*'));
    
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      
      const resolveColor = (prop, fallback) => {
        const value = style[prop];
        if (!value || !value.includes('oklch')) return value;
        
        const classes = el.className;
        if (typeof classes !== 'string') return fallback;

        if (prop === 'backgroundColor') {
          if (classes.includes('bg-white')) return '#ffffff';
          if (classes.includes('bg-black')) return '#000000';
          if (classes.includes('bg-zinc-100')) return '#f4f4f5';
          if (classes.includes('bg-[#f7f7f5]')) return '#f7f7f5';
          return 'transparent';
        }
        if (prop === 'color') {
          if (classes.includes('text-white')) return '#ffffff';
          if (classes.includes('text-zinc-400')) return '#a1a1aa';
          if (classes.includes('text-zinc-500')) return '#71717a';
          if (classes.includes('text-zinc-700')) return '#3f3f46';
          if (classes.includes('text-zinc-900')) return '#18181b';
          if (classes.includes('text-black')) return '#000000';
          return '#18181b';
        }
        if (prop.includes('Color')) { 
          if (classes.includes('border-zinc-300')) return '#d4d4d8';
          if (classes.includes('border-zinc-900')) return '#18181b';
          if (classes.includes('border-white')) return '#ffffff';
          if (classes.includes('border-black')) return '#000000';
          return 'transparent';
        }
        return fallback;
      };

      el.style.backgroundColor = resolveColor('backgroundColor', 'transparent');
      el.style.color = resolveColor('color', '#18181b');
      el.style.borderColor = resolveColor('borderColor', 'transparent');
      el.style.borderTopColor = resolveColor('borderTopColor', 'transparent');
      el.style.borderRightColor = resolveColor('borderRightColor', 'transparent');
      el.style.borderBottomColor = resolveColor('borderBottomColor', 'transparent');
      el.style.borderLeftColor = resolveColor('borderLeftColor', 'transparent');
      el.style.outlineColor = resolveColor('outlineColor', 'transparent');
      el.style.boxShadow = 'none';
      el.style.textShadow = 'none';
    });
  };

  const exportPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true,
        hotfixes: ['px_scaling'],
      });

      const pages = [
        pdfPageGeneralRef.current,
        pdfPageHabilidadesRef.current,
        pdfPageRituaisRef.current,
        pdfPageInformacoesRef.current,
      ].filter(Boolean);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        await waitForImages(page);

        const canvas = await html2canvas(page, {
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#f7f7f5',
          logging: false,
          scrollX: 0,
          scrollY: -window.scrollY,
          onclone: (clonedDoc) => {
            normalizePdfColors(clonedDoc);
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        const ratio = Math.min(
          pageWidth / canvas.width,
          pageHeight / canvas.height
        );

        const renderWidth = canvas.width * ratio;
        const renderHeight = canvas.height * ratio;
        const x = (pageWidth - renderWidth) / 2;
        const y = (pageHeight - renderHeight) / 2;

        if (index > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          imgData,
          'JPEG',
          x,
          y,
          renderWidth,
          renderHeight,
          undefined,
          'FAST'
        );
      }

      const safeName = (data?.nome || 'npc')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();

      pdf.save(`ficha-${safeName}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      setSavedMessage('Erro ao exportar PDF. Veja o console.');
      setTimeout(() => setSavedMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const resumoTopo = useMemo(() => {
    const parts = [data?.classe, data?.trilha].filter(Boolean);
    return parts.length ? parts.join(' • ') : 'Classe • Trilha';
  }, [data?.classe, data?.trilha]);

  const formTabs = [
    { id: 'gerais', label: 'Informações gerais', icon: Shield },
    { id: 'habilidades', label: 'Habilidades', icon: WandSparkles },
    { id: 'rituais', label: 'Rituais', icon: BookOpen },
    { id: 'informacoes', label: 'Itens e infos', icon: StickyNote },
  ];

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1750px] grid-cols-1 gap-6 p-4 xl:grid-cols-[340px_520px_minmax(0,1fr)] xl:p-6">
        
        {/* SIDEBAR DE ARQUIVOS */}
        <aside className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur flex flex-col h-full max-h-[calc(100vh-48px)]">
          <div className="mb-5 shrink-0">
            <div className="mb-2 flex items-center gap-2 text-zinc-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.32em]">C.R.I.S. inspired</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Banco de NPCs</h1>
            <p className="mt-2 text-sm text-zinc-400">Salve, edite e acompanhe PV, PE e sanidade direto na plataforma.</p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 shrink-0">
            <button onClick={createNpc} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500">
              <Plus className="h-4 w-4" /> Novo
            </button>
            <button onClick={saveAll} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500">
              <Save className="h-4 w-4" /> Salvar
            </button>
            <button onClick={duplicateNpc} className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500">Duplicar</button>
            <button onClick={deleteNpc} className="rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-700">Excluir</button>
          </div>

          {savedMessage && <div className="mb-4 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 shrink-0">{savedMessage}</div>}

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {npcs.map((npc) => (
              <NpcCard
                key={npc.id}
                npc={npc}
                isActive={npc.id === data.id}
                onSelect={() => setActiveNpcId(npc.id)}
                onAdjust={(field, delta) => adjustStat(field, delta, npc.id)}
              />
            ))}
          </div>
        </aside>

        {/* EDITOR */}
        <aside className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur flex flex-col h-full max-h-[calc(100vh-48px)]">
          <div className="mb-5 flex flex-wrap gap-3 shrink-0">
            <button
                onClick={exportPdf}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileDown className="h-4 w-4" />
                {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
              </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500">
              <ImagePlus className="h-4 w-4" /> Imagem
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3 shrink-0">
            <StatQuickAdjust icon={Heart} label="PV" current={data.pvAtual} max={data.pv} onAdjust={(delta) => adjustStat('pvAtual', delta)} />
            <StatQuickAdjust icon={Zap} label="PE" current={data.peAtual} max={data.pe} onAdjust={(delta) => adjustStat('peAtual', delta)} />
            <StatQuickAdjust icon={Brain} label="Sanidade" current={data.sanidadeAtual} max={data.sanidade} onAdjust={(delta) => adjustStat('sanidadeAtual', delta)} />
          </div>

          <div className="mb-4 flex flex-wrap gap-2 shrink-0">
            {formTabs.map((tab) => {
              const Icon = tab.icon;
              const active = formTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFormTab(tab.id)}
                  className={`${tabButtonStyle} ${active ? 'bg-white text-black' : 'border border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'}`}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-6 overflow-y-auto pr-1 flex-1 pb-10">
            {formTab === 'gerais' && (
              <>
                <div>
                  <SectionTitle>Identificação</SectionTitle>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label="Nome" value={data.nome} onChange={(e) => handleChange('nome', e.target.value)} />
                    <Field label="Equipe" value={data.equipe} onChange={(e) => handleChange('equipe', e.target.value)} />
                    <Field label="Origem" value={data.origem} onChange={(e) => handleChange('origem', e.target.value)} />
                    <Field label="Classe" value={data.classe} onChange={(e) => handleChange('classe', e.target.value)} />
                    <Field label="Trilha" value={data.trilha} onChange={(e) => handleChange('trilha', e.target.value)} />
                    <Field label="NEX" value={data.nex} onChange={(e) => handleChange('nex', e.target.value)} placeholder="0" />
                  </div>
                </div>

                <div>
                  <SectionTitle>Elementos</SectionTitle>
                  <div className="grid grid-cols-1 gap-3">
                    <label className="space-y-2">
                      <div className={labelStyle}>Elemento principal</div>
                      <select className={inputStyle} value={data.elementoPrincipal} onChange={(e) => handleChange('elementoPrincipal', e.target.value)}>
                        {elementOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <SecondaryElementPicker selected={data.elementosSecundarios} onToggle={toggleSecondaryElement} />
                  </div>
                </div>

                <div>
                  <SectionTitle>Recursos e defesa</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="PV" value={data.pv} onChange={(e) => handleChange('pv', e.target.value)} />
                    <Field label="PV atual" value={data.pvAtual} onChange={(e) => handleChange('pvAtual', e.target.value)} />
                    <Field label="PE" value={data.pe} onChange={(e) => handleChange('pe', e.target.value)} />
                    <Field label="PE atual" value={data.peAtual} onChange={(e) => handleChange('peAtual', e.target.value)} />
                    <Field label="Sanidade" value={data.sanidade} onChange={(e) => handleChange('sanidade', e.target.value)} />
                    <Field label="Sanidade atual" value={data.sanidadeAtual} onChange={(e) => handleChange('sanidadeAtual', e.target.value)} />
                    <Field label="Defesa" value={data.defesa} onChange={(e) => handleChange('defesa', e.target.value)} />
                    <Field label="Deslocamento" value={data.deslocamento} onChange={(e) => handleChange('deslocamento', e.target.value)} />
                    <Field label="Fortitude" value={data.fortitude} onChange={(e) => handleChange('fortitude', e.target.value)} />
                    <Field label="Reflexos" value={data.reflexos} onChange={(e) => handleChange('reflexos', e.target.value)} />
                    <Field label="Vontade" value={data.vontade} onChange={(e) => handleChange('vontade', e.target.value)} />
                    <Field label="Iniciativa" value={data.iniciativa} onChange={(e) => handleChange('iniciativa', e.target.value)} />
                    <Field label="Percepção" value={data.percepcao} onChange={(e) => handleChange('percepcao', e.target.value)} />
                  </div>
                </div>

                <div>
                  <SectionTitle>Atributos</SectionTitle>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      ['agi', 'AGI'],
                      ['forca', 'FOR'],
                      ['int', 'INT'],
                      ['pre', 'PRE'],
                      ['vig', 'VIG'],
                    ].map(([key, label]) => (
                      <label key={key} className="space-y-2">
                        <div className={`${labelStyle} text-center`}>{label}</div>
                        <input type="number" className={`${inputStyle} text-center`} value={data[key]} onChange={(e) => handleChange(key, e.target.value)} />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionTitle>Combate</SectionTitle>
                  <TextBlock label="Perícias" value={data.pericias} onChange={(e) => handleChange('pericias', e.target.value)} placeholder="Ex.: Investigação +10, Ocultismo +12, Vontade +9" rows={6} />
                  <TextBlock label="Resistências" value={data.resistencias} onChange={(e) => handleChange('resistencias', e.target.value)} rows={4} />
                  <TextBlock label="Vulnerabilidades" value={data.vulnerabilidades} onChange={(e) => handleChange('vulnerabilidades', e.target.value)} rows={4} />
                  <TextBlock label="Imunidades" value={data.imunidades} onChange={(e) => handleChange('imunidades', e.target.value)} rows={4} />
                </div>

                <div>
                  <SectionTitle>Ataques</SectionTitle>
                  <div className="space-y-3">
                    {data.ataques.map((ataque, index) => (
                      <div key={index} className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 p-3 md:grid-cols-2">
                        <Field label="Ataque" value={ataque.nome} onChange={(e) => handleAttackChange(index, 'nome', e.target.value)} />
                        <Field label="Teste" value={ataque.teste} onChange={(e) => handleAttackChange(index, 'teste', e.target.value)} />
                        <Field label="Dano" value={ataque.dano} onChange={(e) => handleAttackChange(index, 'dano', e.target.value)} />
                        <Field label="Crítico / Alcance / Especial" value={ataque.extra} onChange={(e) => handleAttackChange(index, 'extra', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionTitle>Imagem</SectionTitle>
                  {data.imagem ? (
                    <div className="overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-950">
                      <img src={data.imagem} alt={data.nome || 'NPC'} className="h-64 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-zinc-700 bg-zinc-950 text-sm text-zinc-500">Sem imagem carregada</div>
                  )}
                </div>
              </>
            )}

            {formTab === 'habilidades' && (
              <>
                <SectionTitle>Habilidades</SectionTitle>
                <div className="space-y-4">
                  {(data.habilidades || []).map((item, index) => {
                    const hab = typeof item === 'string' ? { nome: item, descricao: '' } : item;
                    return (
                      <div key={index} className="flex flex-col gap-2 rounded-2xl border border-zinc-800 p-3">
                        <div className="flex gap-2">
                          <input 
                            className={inputStyle} 
                            value={hab.nome} 
                            onChange={(e) => handleComplexItemChange('habilidades', index, 'nome', e.target.value)} 
                            placeholder={`Nome da Habilidade ${index + 1}`} 
                          />
                          <button onClick={() => removeListItem('habilidades', index)} className="rounded-2xl border border-zinc-800 px-3 hover:border-zinc-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea 
                          className={textareaStyle} 
                          value={hab.descricao} 
                          onChange={(e) => handleComplexItemChange('habilidades', index, 'descricao', e.target.value)} 
                          placeholder="Descrição da habilidade..." 
                          rows={3} 
                        />
                      </div>
                    );
                  })}
                  <button onClick={() => addComplexItem('habilidades')} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500">
                    <Plus className="h-4 w-4" /> Adicionar habilidade
                  </button>
                </div>
                
                <div className="mt-8">
                  <TextBlock label="Anotações gerais de habilidades (Opcional)" value={data.habilidadesNotas} onChange={(e) => handleChange('habilidadesNotas', e.target.value)} rows={6} />
                </div>
              </>
            )}

            {formTab === 'rituais' && (
              <>
                <SectionTitle>Rituais</SectionTitle>
                <div className="space-y-4">
                  {(data.rituais || []).map((item, index) => {
                    const ritual = typeof item === 'string' ? { nome: item, descricao: '' } : item;
                    return (
                      <div key={index} className="flex flex-col gap-2 rounded-2xl border border-zinc-800 p-3">
                        <div className="flex gap-2">
                          <input 
                            className={inputStyle} 
                            value={ritual.nome} 
                            onChange={(e) => handleComplexItemChange('rituais', index, 'nome', e.target.value)} 
                            placeholder={`Nome do Ritual ${index + 1}`} 
                          />
                          <button onClick={() => removeListItem('rituais', index)} className="rounded-2xl border border-zinc-800 px-3 hover:border-zinc-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea 
                          className={textareaStyle} 
                          value={ritual.descricao} 
                          onChange={(e) => handleComplexItemChange('rituais', index, 'descricao', e.target.value)} 
                          placeholder="Descrição do ritual..." 
                          rows={3} 
                        />
                      </div>
                    );
                  })}
                  <button onClick={() => addComplexItem('rituais')} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500">
                    <Plus className="h-4 w-4" /> Adicionar ritual
                  </button>
                </div>
              </>
            )}

            {formTab === 'informacoes' && (
              <>
                <SectionTitle>Itens</SectionTitle>
                <div className="space-y-4">
                  {(data.itens || []).map((item, index) => {
                    const objItem = typeof item === 'string' ? { nome: item, descricao: '' } : item;
                    return (
                      <div key={index} className="flex flex-col gap-2 rounded-2xl border border-zinc-800 p-3">
                        <div className="flex gap-2">
                          <input 
                            className={inputStyle} 
                            value={objItem.nome} 
                            onChange={(e) => handleComplexItemChange('itens', index, 'nome', e.target.value)} 
                            placeholder={`Nome do Item ${index + 1}`} 
                          />
                          <button onClick={() => removeListItem('itens', index)} className="rounded-2xl border border-zinc-800 px-3 hover:border-zinc-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <textarea 
                          className={textareaStyle} 
                          value={objItem.descricao} 
                          onChange={(e) => handleComplexItemChange('itens', index, 'descricao', e.target.value)} 
                          placeholder="Descrição do item..." 
                          rows={3} 
                        />
                      </div>
                    );
                  })}
                  <button onClick={() => addComplexItem('itens')} className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500">
                    <Plus className="h-4 w-4" /> Adicionar item
                  </button>
                </div>

                <div className="mt-8 space-y-6">
                  <TextBlock label="Anotações gerais de itens (Opcional)" value={data.itensNotas} onChange={(e) => handleChange('itensNotas', e.target.value)} rows={4} />
                  <TextBlock label="Aparência" value={data.aparencia} onChange={(e) => handleChange('aparencia', e.target.value)} rows={6} />
                  <TextBlock label="História" value={data.historia} onChange={(e) => handleChange('historia', e.target.value)} rows={10} />
                  <TextBlock label="Anotações gerais" value={data.anotacoesGerais} onChange={(e) => handleChange('anotacoesGerais', e.target.value)} rows={8} />
                  <TextBlock label="Informações extras" value={data.informacoesGerais} onChange={(e) => handleChange('informacoesGerais', e.target.value)} rows={8} />
                </div>
              </>
            )}
          </div>
        </aside>

        {/* VISUALIZAÇÃO PDF - ESTRUTURA BLINDADA PARA O HTML2CANVAS */}
        <main className="min-w-0 flex-1 overflow-auto pb-20">
          <div className="w-max mx-auto flex flex-col items-center gap-8 px-4">

            {/* PÁGINA 1: FICHA GERAL + ATAQUES */}
            <section ref={pdfPageGeneralRef} className="h-[1123px] w-[794px] shrink-0 bg-[#f7f7f5] shadow-2xl overflow-hidden relative text-zinc-900 font-sans">
              <div className="flex h-full flex-col border-[3px] border-zinc-900 px-6 py-5">
                <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                  <div className="text-[200px] font-black tracking-[0.25em]">OP</div>
                </div>

                {/* HEADER FIXO - ZERO ELIPSES OU NOWRAP PARA EVITAR BUG DO HTML2CANVAS */}
                <div className="relative flex gap-4 shrink-0 h-[140px] w-full">
                  
                  {/* BOX 1: NOME, ORIGEM E EQUIPE */}
                  <div className="rounded-[18px] border-[3px] border-zinc-900 bg-white flex flex-col p-3 w-[320px] overflow-hidden shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-900 mb-1">Nome do NPC</div>
                    <div className="text-xl font-black leading-tight uppercase text-zinc-900 max-h-[46px] overflow-hidden break-words mb-2">
                      {data.nome || 'Nome da criatura'}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-700 max-h-[16px] overflow-hidden break-words mb-1">
                      <strong className="text-black font-bold">Origem:</strong> {data.origem || '—'}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-700 max-h-[16px] overflow-hidden break-words">
                      <strong className="text-black font-bold">Equipe:</strong> {data.equipe || '—'}
                    </div>
                  </div>
                  
                  {/* BOX 2: CLASSE/TRILHA E NEX */}
                  <div className="rounded-[18px] border-[3px] border-zinc-900 bg-white flex flex-col p-3 w-[220px] overflow-hidden shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-900 mb-1">Classe / Trilha</div>
                    <div className="text-base font-black leading-tight uppercase text-zinc-900 max-h-[40px] overflow-hidden break-words mb-2">
                      {resumoTopo}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-900 mb-1">NEX</div>
                    <div className="text-xl font-black leading-none text-zinc-900 overflow-hidden">
                      {data.nex || '0'}%
                    </div>
                  </div>
                  
                  {/* BOX 3: LOGO DA ORDEM */}
                  <div className="flex flex-col items-end justify-center text-right flex-1 overflow-hidden">
          
                    <div className="mt-2 text-xl font-black uppercase tracking-[0.22em] text-zinc-900">Ficha NPC</div>
                  </div>

                </div>

                {/* 3 Colunas Principais - Altura Fixa (600px) garantida */}
                <div className="relative mt-4 flex gap-4 shrink-0 h-[600px] w-full">
                  
                  {/* Coluna 1 */}
                  <div className="flex flex-col gap-4 h-full w-[250px] shrink-0">
                    <LineBox title="Elementos" className="shrink-0">
                      <div className="space-y-2 text-[12px]">
                        <div className="border-b border-zinc-300 pb-1"><strong>Principal:</strong> {data.elementoPrincipal || '—'}</div>
                        <div className="border-b border-zinc-300 pb-1"><strong>Secundários:</strong> {data.elementosSecundarios.length ? data.elementosSecundarios.join(', ') : '—'}</div>
                      </div>
                    </LineBox>
                    <LineBox title="Sentidos" className="shrink-0">
                      <div className="space-y-2 text-[12px]">
                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1"><span>Percepção</span><span className="font-bold">{data.percepcao || '—'}</span></div>
                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1"><span>Iniciativa</span><span className="font-bold">{data.iniciativa || '—'}</span></div>
                      </div>
                    </LineBox>
                    <LineBox title="Defesa" className="shrink-0">
                      <div className="space-y-2 text-[12px]">
                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1"><span>Defesa</span><span className="font-bold">{data.defesa || '—'}</span></div>
                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1"><span>Fortitude</span><span className="font-bold">{data.fortitude || '—'}</span></div>
                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1"><span>Reflexos</span><span className="font-bold">{data.reflexos || '—'}</span></div>
                        <div className="flex items-center justify-between border-b border-zinc-300 pb-1"><span>Vontade</span><span className="font-bold">{data.vontade || '—'}</span></div>
                      </div>
                    </LineBox>
                    <div className="flex gap-2 shrink-0">
                      <LineBox title="PV" className="flex-1 px-1"><div className="flex h-[40px] items-center justify-center text-xl font-black">{data.pv || '0'}</div></LineBox>
                      <LineBox title="PE" className="flex-1 px-1"><div className="flex h-[40px] items-center justify-center text-xl font-black">{data.pe || '0'}</div></LineBox>
                      <LineBox title="SAN" className="flex-1 px-1"><div className="flex h-[40px] items-center justify-center text-xl font-black">{data.sanidade || '0'}</div></LineBox>
                    </div>
                  </div>

                  {/* Coluna 2 */}
                  <div className="flex flex-col gap-4 h-full w-[250px] shrink-0">
                    <LineBox title="Atributos" className="shrink-0">
                      <div className="flex justify-between px-1 py-1">
                        <HexStat label="AGI" value={data.agi} />
                        <HexStat label="FOR" value={data.forca} />
                        <HexStat label="INT" value={data.int} />
                        <HexStat label="PRE" value={data.pre} />
                        <HexStat label="VIG" value={data.vig} />
                      </div>
                    </LineBox>
                    <LineBox title="Perícias" className="flex-1">
                      <div className="text-[11px] leading-relaxed whitespace-pre-wrap">{data.pericias || '—'}</div>
                    </LineBox>
                  </div>

                  {/* Coluna 3 */}
                  <div className="flex flex-col gap-4 h-full flex-1 min-w-0">
                    <LineBox title="Imagem" className="h-[240px] shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-[12px] border border-zinc-300 bg-zinc-100 flex items-center justify-center relative">
                        {data.imagem ? <img src={data.imagem} alt="NPC" className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-[10px] uppercase tracking-widest text-zinc-400">Sem Imagem</span>}
                      </div>
                    </LineBox>
                    <LineBox title="Defesas Adicionais" className="flex-1">
                      <div className="space-y-3 text-[11px]">
                        <div className="border-b border-zinc-300 pb-1">Resistências: {data.resistencias || '—'}</div>
                        <div className="border-b border-zinc-300 pb-1">Vulnerabilidades: {data.vulnerabilidades || '—'}</div>
                        <div className="border-b border-zinc-300 pb-1">Imunidades: {data.imunidades || '—'}</div>
                        <div className="border-b border-zinc-300 pb-1">Deslocamento: {data.deslocamento || '—'}</div>
                      </div>
                    </LineBox>
                  </div>

                </div>

                {/* Bottom - Ataques (Altura Fixa: 320px) */}
                <div className="relative mt-auto pt-4 shrink-0 h-[320px] w-full">
                  <LineBox title="Ataques" className="h-full">
                    <div className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 border-b-2 border-zinc-900 pb-2 text-[10px] font-bold uppercase tracking-[0.18em]">
                      <div>Ataque</div><div>Teste</div><div>Dano</div><div>Crítico / Especial</div>
                    </div>
                    <div className="mt-2 space-y-3 text-[11px]">
                      {data.ataques.map((ataque, index) => {
                        if(!ataque.nome && !ataque.teste && !ataque.dano && !ataque.extra) return null;
                        return (
                          <div key={index} className="grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 border-b border-zinc-300 pb-2">
                            <div className="font-bold break-words">{ataque.nome || '—'}</div>
                            <div className="break-words">{ataque.teste || '—'}</div>
                            <div className="break-words">{ataque.dano || '—'}</div>
                            <div className="break-words">{ataque.extra || '—'}</div>
                          </div>
                        );
                      })}
                      {data.ataques.every(a => !a.nome && !a.teste && !a.dano && !a.extra) && (
                        <div className="text-zinc-500 italic">Nenhum ataque registrado.</div>
                      )}
                    </div>
                  </LineBox>
                </div>
              </div>
            </section>

            {/* PÁGINA 2: HABILIDADES */}
            <section ref={pdfPageHabilidadesRef} className="h-[1123px] w-[794px] shrink-0 bg-[#f7f7f5] p-8 shadow-2xl overflow-hidden relative text-zinc-900 font-sans">
              <div className="flex h-full flex-col gap-4 border-[3px] border-zinc-900 p-6">
                <LineBox title="Habilidades" className="flex-1">
                  <ComplexList items={data.habilidades || []} emptyText="Nenhuma habilidade adicionada." />
                </LineBox>
                
                {data.habilidadesNotas && (
                  <LineBox title="Anotações de Habilidades" className="shrink-0 max-h-[250px]">
                    <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{data.habilidadesNotas}</div>
                  </LineBox>
                )}
                
                <LineBox title="Aparência" className="h-[250px] shrink-0">
                  <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{data.aparencia || '—'}</div>
                </LineBox>
              </div>
            </section>

            {/* PÁGINA 3: RITUAIS */}
            <section ref={pdfPageRituaisRef} className="h-[1123px] w-[794px] shrink-0 bg-[#f7f7f5] p-8 shadow-2xl overflow-hidden relative text-zinc-900 font-sans">
              <div className="flex h-full flex-col gap-4 border-[3px] border-zinc-900 p-6">
                <LineBox title="Rituais" className="flex-1">
                  <ComplexList items={data.rituais || []} emptyText="Nenhum ritual adicionado." />
                </LineBox>
                <LineBox title="História" className="h-[400px] shrink-0">
                  <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{data.historia || '—'}</div>
                </LineBox>
              </div>
            </section>

            {/* PÁGINA 4: INFORMAÇÕES (AGORA COM LISTA COMPLEXA DE ITENS) */}
            <section ref={pdfPageInformacoesRef} className="h-[1123px] w-[794px] shrink-0 bg-[#f7f7f5] p-8 shadow-2xl overflow-hidden relative text-zinc-900 font-sans">
              <div className="flex h-full flex-col gap-4 border-[3px] border-zinc-900 p-6">
                
                <LineBox title="Itens" className="flex-1">
                  <ComplexList items={data.itens || []} emptyText="Nenhum item adicionado." />
                </LineBox>
                
                {data.itensNotas && (
                  <LineBox title="Anotações de Itens" className="shrink-0 max-h-[200px]">
                    <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{data.itensNotas}</div>
                  </LineBox>
                )}

                <div className="grid grid-cols-2 gap-4 shrink-0 h-[300px]">
                  <LineBox title="Anotações Gerais">
                    <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{data.anotacoesGerais || '—'}</div>
                  </LineBox>
                  <LineBox title="Informações Extras">
                    <div className="text-[12px] leading-relaxed whitespace-pre-wrap">{data.informacoesGerais || '—'}</div>
                  </LineBox>
                </div>

              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}