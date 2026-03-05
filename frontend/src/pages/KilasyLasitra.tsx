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
  ActionIcon,
  Badge,
  Loader,
  Alert,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCirclePlus, IconPencil, IconTrash, IconAlertCircle } from '@tabler/icons-react';

interface KilasyLasitra {
  id: number;
  nom: string;
  trancheAge: string;
  description: string | null;
}

const EMPTY_FORM = {
  nom: '',
  trancheAge: '',
  description: '',
};

export default function KilasyLasitra() {
  const [lasitras, setLasitras] = useState<KilasyLasitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<KilasyLasitra | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadLasitras();
  }, []);

  async function loadLasitras() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kilasy-lasitra', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur de chargement');
      setLasitras(await res.json());
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

  function handleEdit(l: KilasyLasitra) {
    setEditingId(l.id);
    setForm({
      nom: l.nom || '',
      trancheAge: l.trancheAge || '',
      description: l.description || '',
    });
    setFormError(null);
    openForm();
  }

  function handleDeleteClick(l: KilasyLasitra) {
    setSelected(l);
    openDelete();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim() || !form.trancheAge.trim()) {
      setFormError('Le nom et la tranche d\'âge sont obligatoires');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        nom: form.nom.trim(),
        trancheAge: form.trancheAge.trim(),
        description: form.description?.trim() || null,
      };

      const url = editingId ? `/api/kilasy-lasitra/${editingId}` : '/api/kilasy-lasitra';
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
      await loadLasitras();
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
      const res = await fetch(`/api/kilasy-lasitra/${selected.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      closeDelete();
      setSelected(null);
      await loadLasitras();
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
          <Title order={2} mb={4}>Modèles de Classe</Title>
          <Text c="dimmed">Définissez les catégories de classes (Lasitra)</Text>
        </Box>
        <Button leftSection={<IconCirclePlus size={18} />} onClick={handleNew}>
          Nouveau modèle
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
        ) : lasitras.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            Aucun modèle trouvé. Cliquez sur « Nouveau modèle » pour commencer.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nom</Table.Th>
                <Table.Th>Tranche d'âge</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th style={{ width: 100 }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {lasitras.map((l) => (
                <Table.Tr key={l.id}>
                  <Table.Td fw={500}>{l.nom}</Table.Td>
                  <Table.Td>
                    <Badge color="blue" variant="outline">{l.trancheAge}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {l.description || '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Modifier">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(l)}>
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Supprimer">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteClick(l)}>
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
        title={editingId ? 'Modifier le modèle' : 'Nouveau modèle'}
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
            placeholder="Ex: Enfants, Adultes..."
            required
            mb="md"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <TextInput
            label="Tranche d'âge"
            placeholder="Ex: 0-6 ans, 14+..."
            required
            mb="md"
            value={form.trancheAge}
            onChange={(e) => setForm({ ...form, trancheAge: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="Description (optionnel)"
            mb="xl"
            autosize
            minRows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
          Supprimer le modèle <strong>{selected?.nom}</strong> ? Cette action est irréversible.
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
