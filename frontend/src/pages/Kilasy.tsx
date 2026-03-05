import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Box,
  Paper,
  Table,
  Group,
  Button,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  ActionIcon,
  Badge,
  Loader,
  Alert,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCirclePlus, IconPencil, IconTrash, IconAlertCircle } from '@tabler/icons-react';

interface Kilasy {
  id: number;
  nom: string;
  description: string | null;
  nbrMambra: number | null;
  nbrMambraUsed: string;
  lasitraId: number | null;
  kilasyLasitra?: KilasyLasitra;
}

interface KilasyLasitra {
  id: number;
  nom: string;
  trancheAge: string;
}

const EMPTY_FORM = {
  nom: '',
  description: '',
  nbrMambra: null as number | null,
  nbrMambraUsed: 'registre',
  lasitraId: null as number | null,
};

export default function Kilasy() {
  const [kilasys, setKilasys] = useState<Kilasy[]>([]);
  const [lasitras, setLasitras] = useState<KilasyLasitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Kilasy | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [kRes, lRes] = await Promise.all([
        fetch('/api/kilasy', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/kilasy-lasitra', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (!kRes.ok || !lRes.ok) throw new Error('Erreur de chargement');
      
      setKilasys(await kRes.json());
      setLasitras(await lRes.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    openForm();
  }

  function handleEdit(k: Kilasy) {
    setEditingId(k.id);
    setForm({
      nom: k.nom || '',
      description: k.description || '',
      nbrMambra: k.nbrMambra,
      nbrMambraUsed: k.nbrMambraUsed || 'registre',
      lasitraId: k.lasitraId,
    });
    setFormError(null);
    openForm();
  }

  function handleDeleteClick(k: Kilasy) {
    setSelected(k);
    openDelete();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) {
      setFormError('Le nom est obligatoire');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        nom: form.nom.trim(),
        description: form.description?.trim() || null,
        nbrMambra: form.nbrMambra === null || form.nbrMambra === '' ? null : Number(form.nbrMambra),
        nbrMambraUsed: form.nbrMambraUsed || 'registre',
        lasitraId: form.lasitraId ? Number(form.lasitraId) : null,
      };

      const url = editingId ? `/api/kilasy/${editingId}` : '/api/kilasy';
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
      const res = await fetch(`/api/kilasy/${selected.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      closeDelete();
      setSelected(null);
      await loadKilasys();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} mb={4}>Kilasy</Title>
          <Text c="dimmed">Gestion des classes du Sekoly Sabata</Text>
        </Box>
        <Button leftSection={<IconCirclePlus size={18} />} onClick={handleNew}>
          Nouvelle classe
        </Button>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={20} />} color="red" mb="lg" title="Erreur">
          {error}
        </Alert>
      )}

      <Paper shadow="sm" radius="md" withBorder>
        {loading ? (
          <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader />
          </Box>
        ) : kilasys.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            Aucune classe trouvée. Cliquez sur « Nouvelle classe » pour commencer.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nom</Table.Th>
                <Table.Th>Modèle</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th ta="center">Mambra (Custom)</Table.Th>
                <Table.Th ta="center">Utilisé pour Stat</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {kilasys.map((k) => (
                <Table.Tr key={k.id}>
                  <Table.Td fw={500}>{k.nom}</Table.Td>
                  <Table.Td>
                    {k.kilasyLasitra ? (
                      <Badge variant="light" color="blue">
                        {k.kilasyLasitra.nom}
                      </Badge>
                    ) : '—'}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {k.description || '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Badge variant="outline" color="gray">
                      {k.nbrMambra ?? '0'}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="center">
                    {k.nbrMambraUsed === 'custom' ? (
                      <Badge variant="filled" color="teal">Personnalisé</Badge>
                    ) : (
                      <Badge variant="filled" color="blue">Registre</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Modifier">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(k)}>
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Supprimer">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteClick(k)}>
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={formOpened}
        onClose={closeForm}
        title={editingId ? 'Modifier la classe' : 'Nouvelle classe'}
        centered
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <Alert color="red" mb="md" icon={<IconAlertCircle size={20} />}>
              {formError}
            </Alert>
          )}
          <TextInput
            label="Nom"
            placeholder="Nom de la classe"
            required
            mb="md"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <Select
            label="Modèle de classe"
            placeholder="Choisir un modèle"
            mb="md"
            data={lasitras.map(l => ({ value: String(l.id), label: `${l.nom} (${l.trancheAge})` }))}
            value={form.lasitraId ? String(form.lasitraId) : null}
            onChange={(val) => setForm({ ...form, lasitraId: val ? Number(val) : null })}
            clearable
          />
          <Textarea
            label="Description"
            placeholder="Description (optionnel)"
            mb="md"
            autosize
            minRows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <NumberInput
            label="Nombre de membres"
            placeholder="Optionnel"
            mb="md"
            min={0}
            value={form.nbrMambra ?? undefined}
            onChange={(val) => setForm({ ...form, nbrMambra: val === '' ? null : Number(val) })}
          />
          <Select
            label="Source du nombre de membres"
            data={[
              { value: 'registre', label: 'Depuis le registre' },
              { value: 'custom', label: 'Manuel' },
            ]}
            mb="xl"
            value={form.nbrMambraUsed}
            onChange={(val) => setForm({ ...form, nbrMambraUsed: val || 'registre' })}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeForm}>
              Annuler
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Enregistrer' : 'Créer'}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Confirmer la suppression"
        centered
        size="sm"
      >
        <Text mb="xl">
          Supprimer la classe <strong>{selected?.nom}</strong> ? Cette action est irréversible.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={closeDelete}>
            Annuler
          </Button>
          <Button color="red" onClick={handleDelete} loading={saving}>
            Supprimer
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
