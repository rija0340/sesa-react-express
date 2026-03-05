import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Title,
  Text,
  Box,
  Paper,
  SimpleGrid,
  Group,
  Select,
  RingProgress,
  Badge,
  Loader,
  Alert,
  Button,
  Table,
  Stack,
  SegmentedControl,
  NumberInput,
  MultiSelect,
  Accordion,
  Divider,
  ScrollArea,
  Modal,
  TextInput,
  ActionIcon,
  Tooltip,
  Grid,
  Card,
  ThemeIcon,
  rem,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconAlertCircle,
  IconChartBar,
  IconDownload,
  IconFileExcel,
  IconFileText,
  IconPrinter,
  IconStar,
  IconStarOff,
  IconMinus,
  IconUsers,
  IconBook,
  IconCash,
  IconChartLine,
  IconSearch,
  IconX,
  IconChevronUp,
  IconChevronDown,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

dayjs.locale('fr');

/* ── Constants & Translations ──────────────────────────────── */

const INDICATORS = [
  { key: 'mambraTonga', label: 'Mambra tonga' },
  { key: 'mpamangy', label: 'Mpamangy' },
  { key: 'tongaRehetra', label: 'Tonga rehetra' },
  { key: 'nianatraImpito', label: 'Nianatra impito' },
  { key: 'asafi', label: 'Asafi' },
  { key: 'asaSoa', label: 'Asa soa' },
  { key: 'fampianaranaBaiboly', label: 'Fampianarana Baiboly' },
  { key: 'bokyTrakta', label: 'Boky na Trakta nozaraina' },
  { key: 'semineraKaoferansa', label: 'Seminera na kaoferansa' },
  { key: 'alasarona', label: 'Alasarona' },
  { key: 'nahavitaFampTaratasy', label: 'Nahavita fampianarana ara-taratasy' },
  { key: 'batisaTami', label: 'Batisa TAMI' },
  { key: 'fanatitra', label: 'Fanatitra', format: 'money' },
];

const PERIOD_TYPES = [
  { value: 'sabata', label: 'Sabata (Daty iray)' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'semester', label: 'Semestre' },
  { value: 'year', label: 'Année' },
  { value: 'custom', label: 'Personnalisé' },
];

const COLORS = ['#228be6', '#40c057', '#fab005', '#f03e3e', '#845ef7', '#e599f7', '#63e6be', '#ffc9c9'];

interface Kilasy {
  id: string;
  nom: string;
  nbrMambra?: number;
}

interface RegistreData {
  id: string;
  date: string;
  kilasy: string;
  mambraTonga: number;
  mpamangy: number;
  tongaRehetra: number;
  nianatraImpito: number;
  asafi: number;
  asaSoa: number;
  fampianaranaBaiboly: number;
  bokyTrakta: number;
  semineraKaoferansa: number;
  alasarona: number;
  nahavitaFampTaratasy: number;
  batisaTami: number;
  fanatitra: number;
  nbrMambraKilasy: number;
}

interface StatsData {
  periode: {
    du: string;
    au: string;
  };
  statistiques: {
    totalMembresTonga: number;
    moyennePresence: number;
    moyenneApprentissage: number;
    totalFanatitra: number;
  };
  data: RegistreData[];
}

interface SavedReport {
  id: string;
  name: string;
  periodType: string;
  dateDebut: string;
  dateFin: string;
  createdAt: string;
}

/* ── Helper Components ─────────────────────────────────────── */

function StatCard({
  title,
  value,
  suffix,
  color,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: number | string;
  suffix?: string;
  color: string;
  icon?: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}) {
  return (
    <Card shadow="sm" radius="md" p="lg" withBorder>
      <Group justify="space-between" align="flex-start">
        <Box>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            {title}
          </Text>
          <Group gap="xs" align="flex-end" mt="xs">
            <Text size="xl" fw={800}>
              {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
              {suffix && (
                <Text span size="sm" fw={600} c="dimmed">
                  {' '}{suffix}
                </Text>
              )}
            </Text>
            {trend !== undefined && trendValue !== undefined && (
              <Badge
                size="sm"
                variant="light"
                color={trend === 'up' ? 'teal' : trend === 'down' ? 'red' : 'gray'}
                leftSection={
                  trend === 'up' ? (
                    <IconChevronUp size={12} />
                  ) : trend === 'down' ? (
                    <IconChevronDown size={12} />
                  ) : (
                    <IconMinus size={12} />
                  )
                }
              >
                {trendValue}%
              </Badge>
            )}
          </Group>
        </Box>
        {Icon && (
          <ThemeIcon color={color} variant="light" size="lg">
            <Icon style={{ width: rem(20), height: rem(20) }} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export default function Stats() {
  // Data State
  const [kilasys, setKilasys] = useState<Kilasy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [prevStatsData, setPrevStatsData] = useState<StatsData | null>(null);

  // Filter State
  const [periodType, setPeriodType] = useState<'sabata' | 'month' | 'quarter' | 'semester' | 'year' | 'custom'>('sabata');
  const [viewMode, setViewMode] = useState<'dashboard' | 'kilasy' | 'time' | 'comparison'>('dashboard');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['tongaRehetra', 'nianatraImpito']);
  const [comparisonGranularity, setComparisonGranularity] = useState<'date' | 'month' | 'quarter'>('date');
  const [selectedKilasy, setSelectedKilasy] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Date Selection State
  const currentYear = new Date().getFullYear();
  const lastSaturday = dayjs().day(6).isAfter(dayjs()) ? dayjs().day(-1).toDate() : dayjs().day(6).toDate();

  const [refDate, setRefDate] = useState<Date>(lastSaturday);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(1);
  const [semester, setSemester] = useState(1);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Saved Reports
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [saveModalOpened, setSaveModalOpened] = useState(false);
  const [reportName, setReportName] = useState('');

  const token = localStorage.getItem('token');
  const componentRef = useRef<HTMLDivElement>(null);

  // Load kilasys and saved reports
  useEffect(() => {
    loadKilasys();
    loadSavedReports();
  }, []);

  async function loadKilasys() {
    try {
      const res = await fetch('/api/kilasy', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKilasys(data);
      }
    } catch (e) {
      console.error('Error loading kilasys:', e);
    }
  }

  function loadSavedReports() {
    const reports = localStorage.getItem('savedStatsReports');
    if (reports) {
      setSavedReports(JSON.parse(reports));
    }
  }

  function saveReport() {
    const newReport: SavedReport = {
      id: Date.now().toString(),
      name: reportName,
      periodType,
      dateDebut: dateRange.start,
      dateFin: dateRange.end,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedReports, newReport];
    setSavedReports(updated);
    localStorage.setItem('savedStatsReports', JSON.stringify(updated));
    setSaveModalOpened(false);
    setReportName('');
  }

  function deleteReport(id: string) {
    const updated = savedReports.filter((r) => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem('savedStatsReports', JSON.stringify(updated));
  }

  function loadSavedReport(report: SavedReport) {
    setPeriodType(report.periodType as any);
    if (report.periodType === 'sabata') {
      setRefDate(new Date(report.dateDebut));
    } else if (report.periodType === 'custom') {
      setCustomStart(report.dateDebut);
      setCustomEnd(report.dateFin);
    }
    // For other types, extract year/month from date
    const start = dayjs(report.dateDebut);
    setYear(start.year());
    setMonth(start.month() + 1);
  }

  // Derived effective date range
  const dateRange = useMemo(() => {
    let start = '';
    let end = '';

    switch (periodType) {
      case 'sabata':
        start = refDate ? dayjs(refDate).format('YYYY-MM-DD') : '';
        end = start;
        break;
      case 'month':
        const lastDay = new Date(year, month, 0).getDate();
        start = `${year}-${String(month).padStart(2, '0')}-01`;
        end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        break;
      case 'quarter':
        const qStartMonth = (quarter - 1) * 3;
        const qEndMonth = qStartMonth + 2;
        const qLastDay = new Date(year, qEndMonth + 1, 0).getDate();
        start = `${year}-${String(qStartMonth + 1).padStart(2, '0')}-01`;
        end = `${year}-${String(qEndMonth + 1).padStart(2, '0')}-${qLastDay}`;
        break;
      case 'semester':
        const sStartMonth = (semester - 1) * 6;
        const sEndMonth = sStartMonth + 5;
        const sLastDay = new Date(year, sEndMonth + 1, 0).getDate();
        start = `${year}-${String(sStartMonth + 1).padStart(2, '0')}-01`;
        end = `${year}-${String(sEndMonth + 1).padStart(2, '0')}-${sLastDay}`;
        break;
      case 'year':
        start = `${year}-01-01`;
        end = `${year}-12-31`;
        break;
      case 'custom':
        start = customStart;
        end = customEnd;
        break;
    }
    return { start, end };
  }, [periodType, refDate, year, month, quarter, semester, customStart, customEnd]);

  // Calculate previous period date range
  const prevDateRange = useMemo(() => {
    const start = dayjs(dateRange.start);
    const end = dayjs(dateRange.end);
    const duration = end.diff(start, 'day') + 1;

    let prevStart: dayjs.Dayjs;
    let prevEnd: dayjs.Dayjs;

    switch (periodType) {
      case 'month':
        prevStart = start.subtract(1, 'month').startOf('month');
        prevEnd = prevStart.endOf('month');
        break;
      case 'quarter':
        prevStart = start.subtract(3, 'month').startOf('month');
        prevEnd = prevStart.endOf('quarter');
        break;
      case 'semester':
        prevStart = start.subtract(6, 'month').startOf('month');
        prevEnd = prevStart.add(5, 'month');
        break;
      case 'year':
        prevStart = start.subtract(1, 'year').startOf('year');
        prevEnd = prevStart.endOf('year');
        break;
      default:
        prevStart = start.subtract(duration, 'day');
        prevEnd = prevStart.add(duration - 1, 'day');
    }

    return {
      start: prevStart.format('YYYY-MM-DD'),
      end: prevEnd.format('YYYY-MM-DD'),
    };
  }, [dateRange, periodType]);

  // Load Stats
  const loadStats = async () => {
    if (!dateRange.start || !dateRange.end) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        dateDebut: dateRange.start,
        dateFin: dateRange.end,
      });

      const res = await fetch(`/api/stats/summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setStatsData(data);

      // Load previous period for comparison
      const prevParams = new URLSearchParams({
        dateDebut: prevDateRange.start,
        dateFin: prevDateRange.end,
      });
      const prevRes = await fetch(`/api/stats/summary?${prevParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (prevRes.ok) {
        const prevData = await prevRes.json();
        setPrevStatsData(prevData);
      }
    } catch (e: any) {
      setError(e.message);
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trends
  const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'neutral'; value: number } => {
    if (previous === 0) return { trend: 'neutral', value: 0 };
    const diff = ((current - previous) / previous) * 100;
    return {
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      value: Math.abs(Math.round(diff)),
    };
  };

  // Calculate number of sabbats
  const numSabbats = useMemo(() => {
    if (!statsData?.data) return 0;
    const uniqueDates = new Set(statsData.data.map((r) => r.date));
    return uniqueDates.size;
  }, [statsData]);

  // Filter data by selected kilasy and search
  const filteredData = useMemo(() => {
    if (!statsData?.data) return [];
    return statsData.data.filter((r) => {
      const matchesKilasy = selectedKilasy.length === 0 || selectedKilasy.includes(r.kilasy);
      const matchesSearch =
        searchQuery === '' ||
        r.kilasy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dayjs(r.date).format('DD/MM/YYYY').includes(searchQuery);
      return matchesKilasy && matchesSearch;
    });
  }, [statsData, selectedKilasy, searchQuery]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredData.length) return { bar: [], line: [], pie: [] };

    // Bar data - by kilasy
    const byKilasy = filteredData.reduce((acc, r) => {
      if (!acc[r.kilasy]) {
        acc[r.kilasy] = { name: r.kilasy, presents: 0, apprentissage: 0, offrandes: 0 };
      }
      acc[r.kilasy].presents += r.tongaRehetra;
      acc[r.kilasy].apprentissage += r.nianatraImpito;
      acc[r.kilasy].offrandes += r.fanatitra;
      return acc;
    }, {} as Record<string, any>);

    // Line data - by date
    const byDate = filteredData.reduce((acc, r) => {
      const dateKey = dayjs(r.date).format('DD/MM');
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, presents: 0, apprentissage: 0, offrandes: 0 };
      }
      acc[dateKey].presents += r.tongaRehetra;
      acc[dateKey].apprentissage += r.nianatraImpito;
      acc[dateKey].offrandes += r.fanatitra;
      return acc;
    }, {} as Record<string, any>);

    // Pie data - indicator distribution
    const totalIndicators = INDICATORS.reduce((acc, ind) => {
      const total = filteredData.reduce((sum, r) => sum + (r[ind.key as keyof RegistreData] as number), 0);
      if (total > 0) {
        acc.push({ name: ind.label, value: total });
      }
      return acc;
    }, [] as any[]);

    return {
      bar: Object.values(byKilasy),
      line: Object.values(byDate),
      pie: totalIndicators.slice(0, 8), // Top 8
    };
  }, [filteredData]);

  // Calculate matrix for table display
  const matrix = useMemo(() => {
    if (!filteredData.length) return null;

    const raw = filteredData;
    const kilasyList = kilasys || [];

    let columns: { key: string; label: string; id?: string }[] = [];

    if (viewMode === 'comparison') {
      const uniqueDates = [...new Set(raw.map((r) => r.date))].sort();

      if (comparisonGranularity === 'month') {
        const uniqueMonths = [...new Set(raw.map((r) => dayjs(r.date).format('YYYY-MM')))].sort();
        columns = uniqueMonths.map((m) => ({ key: m, label: dayjs(m).locale('fr').format('MMMM YYYY') }));
      } else if (comparisonGranularity === 'quarter') {
        const getQ = (d: string) => `T${Math.ceil((dayjs(d).month() + 1) / 3)} ${dayjs(d).year()}`;
        const uniqueQs = [...new Set(raw.map((r) => getQ(r.date)))].sort();
        columns = uniqueQs.map((q) => ({ key: q, label: q }));
      } else {
        columns = uniqueDates.map((d) => ({ key: d, label: dayjs(d).format('DD/MM') }));
      }

      const tables = INDICATORS.filter((i) => selectedIndicators.includes(i.key)).map((ind) => {
        const rowsForInd: Record<string, any> = {};
        kilasyList.forEach((k) => {
          rowsForInd[k.nom] = {
            key: k.nom,
            label: k.nom,
            total: 0,
            byCol: {} as Record<string, number>,
            byColBase: {} as Record<string, number>,
            format: ind.format,
            baseSum: 0,
            nbrMambra: k.nbrMambra || 0,
            average: 0,
            percentage: 0,
          };
          columns.forEach((col) => {
            rowsForInd[k.nom].byCol[col.key] = 0;
            rowsForInd[k.nom].byColBase[col.key] = 0;
          });
        });

        raw.forEach((record) => {
          let colKey = '';
          if (comparisonGranularity === 'month') {
            colKey = dayjs(record.date).format('YYYY-MM');
          } else if (comparisonGranularity === 'quarter') {
            colKey = `T${Math.ceil((dayjs(record.date).month() + 1) / 3)} ${dayjs(record.date).year()}`;
          } else {
            colKey = record.date;
          }

          const rowKey = record.kilasy;
          if (!rowsForInd[rowKey]) {
            rowsForInd[rowKey] = {
              key: rowKey,
              label: rowKey,
              total: 0,
              byCol: {} as Record<string, number>,
              byColBase: {} as Record<string, number>,
              format: ind.format,
              baseSum: 0,
              nbrMambra: 0,
              average: 0,
              percentage: 0,
            };
            columns.forEach((col) => {
              rowsForInd[rowKey].byCol[col.key] = 0;
              rowsForInd[rowKey].byColBase[col.key] = 0;
            });
          }

          const val = Number(record[ind.key as keyof RegistreData]) || 0;
          rowsForInd[rowKey].total += val;
          rowsForInd[rowKey].byCol[colKey] = (rowsForInd[rowKey].byCol[colKey] || 0) + val;

          let baseVal = 0;
          if (ind.key === 'tongaRehetra' || ind.key === 'mambraTonga') {
            baseVal = Number(record.nbrMambraKilasy) || rowsForInd[rowKey].nbrMambra;
          } else if (ind.key === 'nianatraImpito') {
            baseVal = Number(record.tongaRehetra) || 0;
          }
          rowsForInd[rowKey].baseSum += baseVal;
          rowsForInd[rowKey].byColBase[colKey] = (rowsForInd[rowKey].byColBase[colKey] || 0) + baseVal;
        });

        Object.values(rowsForInd).forEach((r: any) => {
          const numSTotal = new Set(raw.map((x) => x.date)).size || 1;
          r.average = r.total / numSTotal;
          r.percentage = r.baseSum > 0 ? (r.total / r.baseSum) * 100 : 0;
        });

        return {
          indicator: ind.key,
          label: ind.label,
          rows: rowsForInd,
          hasPercentage: ['tongaRehetra', 'mambraTonga', 'nianatraImpito'].includes(ind.key),
        };
      });

      return { columns, tables, isComparison: true };
    }

    // Default modes (kilasy or time)
    if (periodType === 'sabata' || viewMode === 'kilasy') {
      columns = kilasyList.map((k) => ({ key: k.nom, label: k.nom, id: k.id }));
    } else {
      const uniqueDates = [...new Set(raw.map((r) => r.date))].sort();
      columns = uniqueDates.map((d) => ({ key: d, label: d }));
    }

    const rows: Record<string, any> = {};
    INDICATORS.forEach((ind) => {
      rows[ind.key] = { label: ind.label, total: 0, byCol: {} as Record<string, number>, average: 0, percentage: 0 };
      columns.forEach((col) => {
        rows[ind.key].byCol[col.key] = 0;
      });
    });

    raw.forEach((record) => {
      const colKey = viewMode === 'time' ? record.date : record.kilasy;
      INDICATORS.forEach((ind) => {
        const val = Number(record[ind.key as keyof RegistreData]) || 0;
        if (rows[ind.key]) {
          rows[ind.key].total += val;
          if (rows[ind.key].byCol[colKey] !== undefined) {
            rows[ind.key].byCol[colKey] += val;
          }
        }
      });
    });

    Object.values(rows).forEach((r: any) => {
      r.average = r.total / (numSabbats || 1);
      if (viewMode === 'kilasy' || periodType === 'sabata') {
        Object.keys(r.byCol).forEach((k) => {
          r.byCol[k] = r.byCol[k] / (numSabbats || 1);
        });
      }
    });

    return { columns, rows };
  }, [filteredData, kilasys, viewMode, periodType, selectedIndicators, numSabbats, comparisonGranularity]);

  const totalEffectiveMembers = useMemo(() => {
    if (!filteredData.length || numSabbats === 0) return 0;
    const sum = filteredData
      .filter((r) => (Number(r.mambraTonga) || 0) > 0)
      .reduce((sum, r) => sum + (Number(r.nbrMambraKilasy) || 0), 0);
    return Math.round(sum / numSabbats);
  }, [filteredData, numSabbats]);

  // ── Export Functions ───────────────────────────────────────

  const exportToCSV = () => {
    if (!filteredData.length) return;
    const headers = ['Date', 'Kilasy', ...INDICATORS.map((i) => i.label)];
    const rows = filteredData.map((r) => [
      r.date,
      r.kilasy,
      ...INDICATORS.map((i) => r[i.key as keyof RegistreData]),
    ]);

    const csv = [headers, ...rows].map((e) => e.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stats_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    if (!filteredData.length) return;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');
    XLSX.writeFile(wb, `stats_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text('Rapport Statistiques SESA', 14, 15);
    doc.setFontSize(10);
    doc.text(`Période: ${dateRange.start} au ${dateRange.end}`, 14, 22);

    const tableData = filteredData.map((r) => [
      r.date,
      r.kilasy,
      r.tongaRehetra,
      r.nianatraImpito,
      r.fanatitra,
    ]);

    (doc as any).autoTable({
      head: [['Date', 'Kilasy', 'Présents', 'Apprentissage', 'Offrandes']],
      body: tableData,
      startY: 30,
    });

    doc.save(`stats_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `stats_${dayjs().format('YYYYMMDD_HHmmss')}`,
  });

  const isCurrentReportSaved = useMemo(() => {
    return savedReports.some(
      (r) => r.dateDebut === dateRange.start && r.dateFin === dateRange.end && r.periodType === periodType
    );
  }, [savedReports, dateRange, periodType]);

  return (
    <Box ref={componentRef}>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} mb={4}>Statistiques</Title>
          <Text c="dimmed">Tatitra Sabata & Rétrospectives</Text>
        </Box>
        <Group>
          <Tooltip label="Exporter CSV">
            <ActionIcon variant="outline" color="green" onClick={exportToCSV}>
              <IconFileExcel size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Exporter Excel">
            <ActionIcon variant="outline" color="green" onClick={exportToExcel}>
              <IconDownload size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Exporter PDF">
            <ActionIcon variant="outline" color="red" onClick={exportToPDF}>
              <IconFileText size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Imprimer">
            <ActionIcon variant="outline" onClick={handlePrint}>
              <IconPrinter size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={isCurrentReportSaved ? 'Rapport sauvegardé' : 'Sauvegarder le rapport'}>
            <ActionIcon
              variant={isCurrentReportSaved ? 'filled' : 'outline'}
              color="yellow"
              onClick={() => setSaveModalOpened(true)}
            >
              {isCurrentReportSaved ? <IconStar size={18} /> : <IconStarOff size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* ── Filters ────────────────────────────────────────── */}
      <Paper shadow="sm" radius="md" p="lg" withBorder mb="lg">
        <Stack gap="md">
          <Group align="flex-end">
            <Select
              label="Type de période"
              data={PERIOD_TYPES}
              value={periodType}
              onChange={(v) => {
                setPeriodType(v as any);
                setStatsData(null);
              }}
              allowDeselect={false}
              style={{ width: 200 }}
            />

            {periodType === 'sabata' && (
              <DatePickerInput
                label="Date du Sabbat"
                placeholder="Choisir un samedi"
                value={refDate}
                onChange={(value) => value && setRefDate(value)}
                locale="fr"
                excludeDate={(date) => date.getDay() !== 6}
                valueFormat="DD MMMM YYYY"
              />
            )}

            {periodType === 'month' && (
              <>
                <NumberInput
                  label="Année"
                  value={year}
                  onChange={(value) => setYear(typeof value === 'number' ? value : parseInt(value) || currentYear)}
                  min={2000}
                  max={2100}
                  allowDecimal={false}
                />
                <Select
                  label="Mois"
                  data={[
                    { value: '1', label: 'Janoary' },
                    { value: '2', label: 'Febroary' },
                    { value: '3', label: 'Martsa' },
                    { value: '4', label: 'Aprily' },
                    { value: '5', label: 'May' },
                    { value: '6', label: 'Jona' },
                    { value: '7', label: 'Jolay' },
                    { value: '8', label: 'Aogositra' },
                    { value: '9', label: 'Septambra' },
                    { value: '10', label: 'Oktobra' },
                    { value: '11', label: 'Novambra' },
                    { value: '12', label: 'Desambra' },
                  ]}
                  value={String(month)}
                  onChange={(v) => setMonth(Number(v))}
                />
              </>
            )}

            {periodType === 'quarter' && (
              <>
                <NumberInput label="Année" value={year} onChange={(value) => setYear(typeof value === 'number' ? value : parseInt(value) || currentYear)} min={2000} max={2100} allowDecimal={false} />
                <Select
                  label="Trimestre"
                  data={[
                    { value: '1', label: 'T1 (Jan-Mar)' },
                    { value: '2', label: 'T2 (Avr-Jun)' },
                    { value: '3', label: 'T3 (Jul-Sep)' },
                    { value: '4', label: 'T4 (Oct-Dec)' },
                  ]}
                  value={String(quarter)}
                  onChange={(v) => setQuarter(Number(v))}
                />
              </>
            )}

            {periodType === 'semester' && (
              <>
                <NumberInput label="Année" value={year} onChange={(value) => setYear(typeof value === 'number' ? value : parseInt(value) || currentYear)} min={2000} max={2100} allowDecimal={false} />
                <Select
                  label="Semestre"
                  data={[
                    { value: '1', label: 'S1 (Jan-Jun)' },
                    { value: '2', label: 'S2 (Jul-Dec)' },
                  ]}
                  value={String(semester)}
                  onChange={(v) => setSemester(Number(v))}
                />
              </>
            )}

            {periodType === 'year' && (
              <NumberInput label="Année" value={year} onChange={(value) => setYear(typeof value === 'number' ? value : parseInt(value) || currentYear)} min={2000} max={2100} allowDecimal={false} />
            )}

            {periodType === 'custom' && (
              <>
                <Box>
                  <Text size="sm" mb={4}>Du</Text>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
                <Box>
                  <Text size="sm" mb={4}>Au</Text>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </Box>
              </>
            )}

            <Button onClick={loadStats} leftSection={<IconChartBar size={16} />}>
              Générer Rapport
            </Button>
          </Group>

          {/* Advanced Filters */}
          <Group gap="xs">
            <TextInput
              placeholder="Rechercher..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 250 }}
            />
            <MultiSelect
              placeholder="Filtrer par classe"
              data={kilasys.map((k) => ({ value: k.nom, label: k.nom }))}
              value={selectedKilasy}
              onChange={setSelectedKilasy}
              clearable
              style={{ width: 300 }}
            />
          </Group>

          {periodType !== 'sabata' && (
            <Group>
              <Text size="sm" fw={500}>
                Affichage :
              </Text>
              <SegmentedControl
                value={viewMode}
                onChange={(v) => setViewMode(v as any)}
                data={[
                  { label: 'Dashboard', value: 'dashboard' },
                  { label: 'Par Classe', value: 'kilasy' },
                  { label: 'Par Sabbat', value: 'time' },
                  { label: 'Comparatif', value: 'comparison' },
                ]}
              />

              {viewMode === 'comparison' && (
                <Stack gap="xs">
                  <Group gap="xs">
                    <Select
                      label="Colonnes par :"
                      value={comparisonGranularity}
                      onChange={(v) => setComparisonGranularity(v as any)}
                      data={[
                        { label: 'Date (Sabata)', value: 'date' },
                        { label: 'Mois', value: 'month' },
                        { label: 'Trimestre', value: 'quarter' },
                      ]}
                      style={{ width: 160 }}
                      allowDeselect={false}
                    />
                    <MultiSelect
                      label="Indicateurs à comparer :"
                      placeholder="Choisir les indicateurs"
                      value={selectedIndicators}
                      onChange={setSelectedIndicators}
                      data={INDICATORS.map((ind) => ({ value: ind.key, label: ind.label }))}
                      style={{ width: 400 }}
                      clearable
                    />
                  </Group>
                  <Text size="xs" c="dimmed" fs="italic">
                    Note: En mode groupé (Mois/Trimestre), les valeurs affichées sont les moyennes par Sabbat dans la
                    période.
                  </Text>
                </Stack>
              )}
            </Group>
          )}

          {/* Saved Reports */}
          {savedReports.length > 0 && (
            <Group gap="xs">
              <Text size="sm" fw={500}>
                Rapports sauvegardés :
              </Text>
              {savedReports.map((report) => (
                <Badge
                  key={report.id}
                  variant="light"
                  color="blue"
                  rightSection={
                    <ActionIcon size={16} color="red" variant="transparent" onClick={() => deleteReport(report.id)}>
                      <IconX size={12} />
                    </ActionIcon>
                  }
                  style={{ cursor: 'pointer' }}
                  onClick={() => loadSavedReport(report)}
                >
                  {report.name}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Paper>

      {/* ── Output ─────────────────────────────────────────── */}

      {error && (
        <Alert icon={<IconAlertCircle size={20} />} color="red" title="Erreur">
          {error}
        </Alert>
      )}

      {loading && (
        <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader size="lg" />
        </Box>
      )}

      {statsData && !loading && (
        <Stack gap="xl">
          {/* Dashboard View */}
          {viewMode === 'dashboard' && (
            <>
              {/* KPI Cards with Trends */}
              <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
                <StatCard
                  title="Membres Présents"
                  value={numSabbats > 1 ? Math.round(statsData.statistiques.totalMembresTonga / numSabbats) : statsData.statistiques.totalMembresTonga}
                  suffix={`/ ${totalEffectiveMembers}`}
                  color="indigo"
                  icon={IconUsers}
                  {...(prevStatsData &&
                    calculateTrend(
                      numSabbats > 1 ? Math.round(statsData.statistiques.totalMembresTonga / numSabbats) : statsData.statistiques.totalMembresTonga,
                      prevStatsData.statistiques.totalMembresTonga
                    ))}
                />
                <StatCard
                  title="Présence Moyenne"
                  value={statsData.statistiques.moyennePresence}
                  suffix="%"
                  color="teal"
                  icon={IconChartLine}
                  {...(prevStatsData &&
                    calculateTrend(statsData.statistiques.moyennePresence, prevStatsData.statistiques.moyennePresence))}
                />
                <StatCard
                  title="Apprentissage"
                  value={statsData.statistiques.moyenneApprentissage}
                  suffix="%"
                  color="cyan"
                  icon={IconBook}
                  {...(prevStatsData &&
                    calculateTrend(statsData.statistiques.moyenneApprentissage, prevStatsData.statistiques.moyenneApprentissage))}
                />
                <StatCard
                  title="Total Offrandes"
                  value={
                    numSabbats > 1
                      ? Math.round((matrix?.rows?.['fanatitra']?.total ?? 0) / numSabbats)
                      : (matrix?.rows?.['fanatitra']?.total ?? 0)
                  }
                  suffix="Ar"
                  color="yellow"
                  icon={IconCash}
                  {...(prevStatsData &&
                    calculateTrend(
                      numSabbats > 1 ? Math.round((matrix?.rows?.['fanatitra']?.total ?? 0) / numSabbats) : (matrix?.rows?.['fanatitra']?.total ?? 0),
                      prevStatsData.statistiques.totalFanatitra
                    ))}
                />
              </SimpleGrid>

              {/* Charts */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper shadow="sm" radius="md" p="md" withBorder>
                    <Title order={5} mb="md">
                      Présence par Classe
                    </Title>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.bar}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="presents" name="Présents" fill="#228be6" />
                        <Bar dataKey="apprentissage" name="Apprentissage" fill="#40c057" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper shadow="sm" radius="md" p="md" withBorder>
                    <Title order={5} mb="md">
                      Évolution par Date
                    </Title>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.line}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line type="monotone" dataKey="presents" name="Présents" stroke="#228be6" strokeWidth={2} />
                        <Line type="monotone" dataKey="apprentissage" name="Apprentissage" stroke="#40c057" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper shadow="sm" radius="md" p="md" withBorder>
                    <Title order={5} mb="md">
                      Répartition des Indicateurs
                    </Title>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={chartData.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {chartData.pie.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper shadow="sm" radius="md" p="md" withBorder>
                    <Title order={5} mb="md">
                      Offrandes par Classe
                    </Title>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.bar}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Area type="monotone" dataKey="offrandes" name="Offrandes" stroke="#fab005" fill="#fab005" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid.Col>
              </Grid>
            </>
          )}

          {/* Period Header */}
          {numSabbats > 1 && viewMode !== 'dashboard' ? (
            <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-teal-0)', borderColor: 'var(--mantine-color-teal-2)' }}>
              <Group justify="space-between" align="center">
                <Stack gap={0}>
                  <Text size="sm" fw={700} tt="uppercase" c="teal.8">
                    Récapitulatif Périodique
                  </Text>
                  <Title order={1} style={{ fontSize: 32, color: 'var(--mantine-color-teal-9)' }}>
                    {dayjs(dateRange.start).locale('fr').format('MMM YYYY')} — {dayjs(dateRange.end).locale('fr').format('MMM YYYY')}
                  </Title>
                </Stack>
                <Box ta="right">
                  <Badge size="xl" color="teal" variant="filled" style={{ height: 50, padding: '0 25px' }}>
                    {numSabbats} SABBATS
                  </Badge>
                  <Text size="xs" mt={5} c="dimmed" fw={500}>
                    Les chiffres ci-dessous sont des <b>moyennes par Sabbat</b>
                  </Text>
                </Box>
              </Group>
            </Paper>
          ) : periodType === 'sabata' && viewMode !== 'dashboard' ? (
            <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-indigo-0)', borderColor: 'var(--mantine-color-indigo-2)' }}>
              <Stack gap={0} align="center">
                <Text size="sm" fw={700} tt="uppercase" c="indigo.8">
                  Tatitra Sabata
                </Text>
                <Title order={1} style={{ fontSize: 32, color: 'var(--mantine-color-indigo-9)' }}>
                  {dayjs(refDate).locale('fr').format('DD MMMM YYYY')}
                </Title>
              </Stack>
            </Paper>
          ) : null}

          {/* Main Matrix Table(s) */}
          {viewMode !== 'dashboard' && matrix && (
            <>
              {(matrix.isComparison ? matrix.tables : [matrix]).map((table: any, _: number) => (
                <Paper key={table.indicator || 'global'} shadow="sm" radius="md" p="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Title order={4}>
                      {matrix.isComparison ? `Comparatif : ${table.label}` : periodType === 'sabata' ? 'Tatitra Sabata' : 'Récapitulatif Périodique'}
                    </Title>
                    <Badge variant="light" size="lg">
                      {statsData.periode.du} au {statsData.periode.au}
                    </Badge>
                  </Group>

                  <ScrollArea>
                    <Table striped withTableBorder withColumnBorders highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ minWidth: 200, backgroundColor: 'var(--mantine-color-gray-0)' }}>
                            {matrix.isComparison ? 'Classe' : 'Rubrique'}
                          </Table.Th>
                          {matrix.columns.map((col: any) => (
                            <Table.Th key={col.key} ta="center" style={{ minWidth: 80 }}>
                              {col.label}
                            </Table.Th>
                          ))}
                          <Table.Th
                            ta="center"
                            style={{ width: 100, backgroundColor: 'var(--mantine-color-orange-0)', color: 'var(--mantine-color-orange-9)' }}
                          >
                            MOYENNE
                          </Table.Th>
                          {matrix.isComparison && table.hasPercentage && (
                            <Table.Th
                              ta="center"
                              style={{ width: 80, backgroundColor: 'var(--mantine-color-blue-0)', color: 'var(--mantine-color-blue-9)' }}
                            >
                              %
                            </Table.Th>
                          )}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {(matrix.isComparison ? Object.values(table.rows) : INDICATORS).map((item: any, _idx: number) => {
                          const rowData = matrix.isComparison ? item : matrix.rows?.[item.key];
                          if (!rowData) return null;

                          const rowLabel = rowData.label;
                          const rowFormat = matrix.isComparison ? rowData.format : INDICATORS.find((i) => i.key === item.key)?.format;

                          return (
                            <Table.Tr key={item.key || rowLabel}>
                              <Table.Td fw={600}>{rowLabel}</Table.Td>
                              {matrix.columns.map((col: any) => {
                                const val = rowData.byCol?.[col.key] || 0;
                                const pct = rowData.byCol?.[col.key + '_pct'];

                                return (
                                  <Table.Td key={col.key} ta="center">
                                    <Stack gap={2}>
                                      <Text size="sm">
                                        {rowFormat === 'money'
                                          ? Math.round(val || 0).toLocaleString('fr-FR')
                                          : (val || 0) % 1 === 0
                                            ? val || 0
                                            : (val || 0).toFixed(1)}
                                      </Text>
                                      {matrix.isComparison && table.hasPercentage && pct !== undefined && (
                                        <Badge variant="subtle" size="xs" color={pct > 80 ? 'teal' : pct > 50 ? 'blue' : 'orange'}>
                                          {Math.round(pct)}%
                                        </Badge>
                                      )}
                                    </Stack>
                                  </Table.Td>
                                );
                              })}
                              <Table.Td ta="center" fw={700} style={{ backgroundColor: 'var(--mantine-color-orange-0)', color: 'var(--mantine-color-orange-9)' }}>
                                {(() => {
                                  const avg = rowData.average;
                                  return rowFormat === 'money'
                                    ? Math.round(avg || 0).toLocaleString('fr-FR')
                                    : (avg || 0) % 1 === 0
                                      ? avg || 0
                                      : (avg || 0).toFixed(1);
                                })()}
                              </Table.Td>
                              {matrix.isComparison && table.hasPercentage && (
                                <Table.Td
                                  ta="center"
                                  fw={700}
                                  style={{ backgroundColor: 'var(--mantine-color-blue-0)', color: 'var(--mantine-color-blue-9)' }}
                                >
                                  {(rowData.percentage || 0).toFixed(0)}%
                                </Table.Td>
                              )}
                            </Table.Tr>
                          );
                        })}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Paper>
              ))}
            </>
          )}

          {filteredData.length === 0 && statsData && (
            <Alert color="blue" title="Aucune donnée">
              Aucun registre trouvé pour la période sélectionnée.
            </Alert>
          )}

          <Accordion variant="separated" radius="md">
            <Accordion.Item value="calculations">
              <Accordion.Control icon={<Text size="sm">ℹ️</Text>}>Comprendre les calculs et la logique des statistiques</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Box>
                    <Text fw={700} size="sm">
                      Averages (Moyennes)
                    </Text>
                    <Text size="sm" c="dimmed">
                      Toutes les données périodiques sont calculées en <b>moyenne par Sabbat</b>. On divise le total cumulé par le nombre de Sabbats uniques trouvés dans les registres.
                    </Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text fw={700} size="sm">
                      Percentages (%)
                    </Text>
                    <Text size="sm" c="dimmed">
                      • <b>% Présence</b> : (Membres présents / Effectif total de la classe) x 100.
                      <br />
                      • <b>% Apprentissage</b> : (Nombre ayant appris la leçon / Total personnes présentes ce jour-là) x 100.
                    </Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text fw={700} size="sm">
                      Tendances
                    </Text>
                    <Text size="sm" c="dimmed">
                      Les flèches indiquent l'évolution par rapport à la période précédente (mois/trimestre/année d'avant).
                      <br />
                      <b>↑</b> Hausse | <b>↓</b> Baisse | <b>−</b> Stable
                    </Text>
                  </Box>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      )}

      {/* Save Report Modal */}
      <Modal opened={saveModalOpened} onClose={() => setSaveModalOpened(false)} title="Sauvegarder le rapport">
        <Stack>
          <TextInput
            label="Nom du rapport"
            placeholder="Ex: Rapport Janvier 2025"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setSaveModalOpened(false)}>
              Annuler
            </Button>
            <Button onClick={saveReport} disabled={!reportName}>
              Sauvegarder
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
