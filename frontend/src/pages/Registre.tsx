import { useState, useEffect, useMemo } from 'react';
import {
  Title,
  Text,
  Box,
  Paper,
  Table,
  Group,
  Button,
  Modal,
  NumberInput,
  Select,
  ActionIcon,
  Badge,
  Loader,
  Alert,
  Tooltip,
  ScrollArea,
  SimpleGrid,
  Stack,
  Divider,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconCirclePlus, IconPencil, IconTrash, IconAlertCircle, IconEye } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

interface Kilasy {
  id: number;
  nom: string;
  description: string | null;
  nbrMambra: number | null;
  nbrMambraUsed: string;
}

interface Registre {
  id: number;
  kilasyId: number;
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
  createdAt: string;
  kilasy?: Kilasy;
}

const REGISTRE_FIELDS = [
  { key: 'mambraTonga', label: 'Mambra tonga', min: 0 },
  { key: 'mpamangy', label: 'Mpamangy', min: 0 },
  { key: 'tongaRehetra', label: 'Tonga rehetra', min: 0, readOnly: true },
  { key: 'nianatraImpito', label: 'Nianatra impito', min: 0 },
  { key: 'asafi', label: 'Asafi', min: 0 },
  { key: 'asaSoa', label: 'Asa soa', min: 0 },
  { key: 'fampianaranaBaiboly', label: 'Fampianarana Baiboly', min: 0 },
  { key: 'bokyTrakta', label: 'Boky na Trakta nozaraina', min: 0 },
  { key: 'semineraKaoferansa', label: 'Seminera na kaoferansa', min: 0 },
  { key: 'alasarona', label: 'Alasarona', min: 0 },
  { key: 'nahavitaFampTaratasy', label: 'Nahavita fampianarana ara-taratasy', min: 0 },
  { key: 'batisaTami', label: 'Batisa TAMI', min: 0 },
  { key: 'fanatitra', label: 'Fanatitra', min: 0 },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date: plus récent' },
  { value: 'date_asc', label: 'Date: plus ancien' },
  { value: 'class_asc', label: 'Classe: A-Z' },
  { value: 'class_desc', label: 'Classe: Z-A' },
];

const EMPTY_FORM: any = {
  kilasyId: null,
  mambraTonga: 0,
  mpamangy: 0,
  tongaRehetra: 0,
  nianatraImpito: 0,
  asafi: 0,
  asaSoa: 0,
  fampianaranaBaiboly: 0,
  bokyTrakta: 0,
  semineraKaoferansa: 0,
  alasarona: 0,
  nahavitaFampTaratasy: 0,
  batisaTami: 0,
  fanatitra: 0,
  createdAt: null,
};

export default function Registre() {
  const [kilasys, setKilasys] = useState<Kilasy[]>([]);
  const [registres, setRegistres] = useState<Registre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Registre | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('date_desc');
  const [classFilter, setClassFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [kRes, rRes] = await Promise.all([
        fetch('/api/kilasy', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/registres', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!kRes.ok || !rRes.ok) throw new Error('Erreur de chargement');
      setKilasys(await kRes.json());
      setRegistres(await rRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getKilasyName(kilasyId: number): string {
    const k = kilasys.find((x) => x.id === kilasyId);
    return k ? k.nom : `#${kilasyId}`;
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return dayjs(dateStr).locale('fr').format('DD MMM YYYY');
  }

  function updateField(key: string, value: any) {
    setForm((prev: any) => {
      const next = { ...prev, [key]: value };
      if (key === 'mambraTonga' || key === 'mpamangy') {
        next.tongaRehetra = (Number(next.mambraTonga) || 0) + (Number(next.mpamangy) || 0);
      }
      return next;
    });
  }

  function handleNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, createdAt: new Date() });
    setFormError(null);
    openForm();
  }

  function handleEdit(r: Registre) {
    setEditingId(r.id);
    setForm({
      kilasyId: r.kilasyId,
      mambraTonga: r.mambraTonga,
      mpamangy: r.mpamangy,
      tongaRehetra: r.tongaRehetra,
      nianatraImpito: r.nianatraImpito,
      asaSoa: r.asaSoa,
      fampianaranaBaiboly: r.fampianaranaBaiboly,
      bokyTrakta: r.bokyTrakta,
      semineraKaoferansa: r.semineraKaoferansa,
      alasarona: r.alasarona,
      nahavitaFampTaratasy: r.nahavitaFampTaratasy,
      batisaTami: r.batisaTami,
      asafi: r.asafi,
      fanatitra: r.fanatitra,
      createdAt: new Date(r.createdAt),
    });
    setFormError(null);
    openForm();
  }

  function handleView(r: Registre) {
    setSelected(r);
    openDetail();
  }

  function handleDeleteClick(r: Registre) {
    setSelected(r);
    openDelete();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.createdAt) {
      setFormError('La date est obligatoire');
      return;
    }
    if (!form.kilasyId) {
      setFormError('La classe est obligatoire');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        kilasyId: Number(form.kilasyId),
        mambraTonga: Number(form.mambraTonga) || 0,
        mpamangy: Number(form.mpamangy) || 0,
        tongaRehetra: Number(form.tongaRehetra) || 0,
        nianatraImpito: Number(form.nianatraImpito) || 0,
        asafi: Number(form.asafi) || 0,
        asaSoa: Number(form.asaSoa) || 0,
        fampianaranaBaiboly: Number(form.fampianaranaBaiboly) || 0,
        bokyTrakta: Number(form.bokyTrakta) || 0,
        semineraKaoferansa: Number(form.semineraKaoferansa) || 0,
        alasarona: Number(form.alasarona) || 0,
        nahavitaFampTaratasy: Number(form.nahavitaFampTaratasy) || 0,
        batisaTami: Number(form.batisaTami) || 0,
        fanatitra: Number(form.fanatitra) || 0,
        createdAt: dayjs(form.createdAt).format('YYYY-MM-DD') + 'T00:00:00+00:00',
      };

      const url = editingId ? `/api/registres/${editingId}` : '/api/registres';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      closeForm();
      await loadData();
      setForm({ ...EMPTY_FORM });
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/registres/${selected.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      closeDelete();
      setSelected(null);
      await loadData();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedDateKey = useMemo(
    () => (form.createdAt ? dayjs(form.createdAt).format('YYYY-MM-DD') : null),
    [form.createdAt]
  );

  const occupiedKilasyIdsForDate = useMemo(() => {
    if (!selectedDateKey) return new Set();
    return new Set(
      registres
        .filter((r) => {
          const isSameDate = dayjs(r.createdAt).format('YYYY-MM-DD') === selectedDateKey;
          const isEditedRegistre = editingId && r.id === editingId;
          return isSameDate && !isEditedRegistre;
        })
        .map((r) => String(r.kilasyId))
    );
  }, [registres, selectedDateKey, editingId]);

  const kilasyOptions = useMemo(() => {
    return kilasys
      .filter(
        (k) =>
          !selectedDateKey ||
          String(k.id) === String(form.kilasyId) ||
          !occupiedKilasyIdsForDate.has(String(k.id))
      )
      .map((k) => ({ value: String(k.id), label: k.nom }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [kilasys, selectedDateKey, form.kilasyId, occupiedKilasyIdsForDate]);

  const classFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Toutes les classes' },
      ...kilasys
        .map((k) => ({ value: String(k.id), label: k.nom }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [kilasys]
  );

  const displayedList = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = registres.filter((r) => {
      if (classFilter !== 'all' && String(r.kilasyId) !== classFilter) {
        return false;
      }

      if (!query) return true;

      const className = getKilasyName(r.kilasyId).toLowerCase();
      const displayDate = formatDate(r.createdAt).toLowerCase();
      const isoDate = dayjs(r.createdAt).format('YYYY-MM-DD');

      return className.includes(query) || displayDate.includes(query) || isoDate.includes(query);
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortMode === 'class_asc') {
        return getKilasyName(a.kilasyId).localeCompare(getKilasyName(b.kilasyId));
      }
      if (sortMode === 'class_desc') {
        return getKilasyName(b.kilasyId).localeCompare(getKilasyName(a.kilasyId));
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [registres, classFilter, searchTerm, sortMode, kilasys]);

  const last5Dates = useMemo(() => {
    return [...registres]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .reduce((acc: any[], curr) => {
        const d = formatDate(curr.createdAt);
        const existing = acc.find((x) => x.date === d);
        if (existing) {
          existing.count += 1;
        } else if (acc.length < 5) {
          acc.push({ date: d, count: 1 });
        }
        return acc;
      }, []);
  }, [registres]);

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} mb={4}>Registre</Title>
          <Text c="dimmed">Tatitra Sabata & Rétrospectives</Text>
        </Box>
        <Button leftSection={<IconCirclePlus size={18} />} onClick={handleNew}>
          Nouveau registre
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={20} />} color="red" mb="lg" title="Erreur">
          {error}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
        <Box style={{ gridColumn: 'span 1' }}>
          <Stack gap="lg">
            <Paper shadow="sm" radius="md" p="md" withBorder>
              <Title order={5} mb="md" c="green.8">
                Info sur les 5 dernières dates
              </Title>
              <Text size="sm" mb="sm">
                Classes totales : <strong>{kilasys.length}</strong>
              </Text>
              <Table variant="unstyled">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Date</Table.Th>
                    <Table.Th align="right">Registres</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {last5Dates.length > 0 ? (
                    last5Dates.map((item, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{item.date}</Table.Td>
                        <Table.Td align="right">
                          <Badge variant="light" color="green">
                            {item.count}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={2}>
                        <Text size="xs" c="dimmed" ta="center">
                          Aucune donnée
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>

            <Paper shadow="sm" radius="md" p="md" withBorder bg="blue.0">
              <Group gap="xs">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--mantine-color-blue-filled)' }} />
                <Text size="xs" fw={700} tt="uppercase">Astuce</Text>
              </Group>
              <Text size="xs" mt="xs">
                Utilisez le bouton <strong>Détails</strong> (œil) pour voir l'ensemble des indicateurs saisis pour chaque classe.
              </Text>
            </Paper>
          </Stack>
        </Box>

        <Box style={{ gridColumn: 'span 3' }}>
          <Paper shadow="sm" radius="md" withBorder>
            <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
                <TextInput
                  placeholder="Rechercher par classe ou date"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  data={SORT_OPTIONS}
                  value={sortMode}
                  onChange={(val) => setSortMode(val || 'date_desc')}
                />
                <Select
                  data={classFilterOptions}
                  value={classFilter}
                  onChange={(val) => setClassFilter(val || 'all')}
                />
              </SimpleGrid>
            </Box>

            {loading ? (
              <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader />
              </Box>
            ) : displayedList.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                Aucun registre trouvé.
              </Text>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Classe</Table.Th>
                      <Table.Th>Présence</Table.Th>
                      <Table.Th>Apprenants</Table.Th>
                      <Table.Th>Offrande</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {displayedList.map((r) => (
                      <Table.Tr key={r.id}>
                        <Table.Td>{formatDate(r.createdAt)}</Table.Td>
                        <Table.Td fw={500}>{getKilasyName(r.kilasyId)}</Table.Td>
                        <Table.Td>
                          <Group gap={6}>
                            <Badge variant="light" color="indigo">{r.mambraTonga}</Badge>
                            <Text size="xs" c="dimmed">+{r.mpamangy}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="teal">{r.nianatraImpito}</Badge>
                        </Table.Td>
                        <Table.Td>
                          {Number(r.fanatitra).toLocaleString()} Ar
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <ActionIcon variant="subtle" color="gray" onClick={() => handleView(r)}>
                              <IconEye size={18} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(r)}>
                              <IconPencil size={18} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteClick(r)}>
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>
        </Box>
      </SimpleGrid>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editingId ? 'Modifier le registre' : 'Nouveau registre'}
        centered
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          {formError && <Alert color="red" mb="md">{formError}</Alert>}

          <SimpleGrid cols={2} mb="md">
            <DatePickerInput
              label="Date"
              placeholder="Samedi"
              required
              value={form.createdAt}
              onChange={(val) => updateField('createdAt', val)}
              locale="fr"
              excludeDate={(date: Date) => date.getDay() !== 6}
            />
            <Select
              label="Classe"
              placeholder="Choisir une classe"
              required
              data={kilasyOptions}
              value={form.kilasyId ? String(form.kilasyId) : null}
              onChange={(val) => updateField('kilasyId', val)}
              searchable
            />
          </SimpleGrid>

          <Divider my="lg" label="Indicateurs" labelPosition="center" />

          <SimpleGrid cols={2}>
            {REGISTRE_FIELDS.map((field) => (
              <NumberInput
                key={field.key}
                label={field.label}
                min={field.min}
                value={form[field.key]}
                onChange={(val) => updateField(field.key, val)}
                readOnly={field.readOnly}
                variant={field.readOnly ? 'filled' : 'default'}
              />
            ))}
          </SimpleGrid>

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={closeForm}>Annuler</Button>
            <Button type="submit" loading={saving}>Enregistrer</Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        title="Détails du registre"
        centered
      >
        {selected && (
          <Stack>
            <Group justify="space-between">
              <Text size="sm">Date</Text>
              <Text size="sm" fw={500}>{formatDate(selected.createdAt)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Classe</Text>
              <Text size="sm" fw={500}>{getKilasyName(selected.kilasyId)}</Text>
            </Group>
            <Divider />
            {REGISTRE_FIELDS.map((f) => (
              <Group key={f.key} justify="space-between">
                <Text size="sm">{f.label}</Text>
                <Text size="sm" fw={500}>{selected[f.key as keyof Registre]}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Supprimer"
        centered
        size="sm"
      >
        <Text size="sm">Voulez-vous supprimer ce registre ?</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={closeDelete}>Annuler</Button>
          <Button color="red" onClick={handleDelete} loading={saving}>Supprimer</Button>
        </Group>
      </Modal>
    </Box>
  );
}
