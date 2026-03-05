import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  Modal,
  TextInput,
  PasswordInput,
  MultiSelect,
  Table,
  ActionIcon,
  Badge,
  Text,
  Paper,
  Title,
  Alert,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  username: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'user', label: 'Utilisateur' },
];

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      roles: [] as string[],
    },
    validate: {
      username: (value) =>
        value.length < 3 ? 'Minimum 3 caractères' : null,
      password: (value) =>
        value.length < 6 ? 'Minimum 6 caractères' : null,
      roles: (value) =>
        value.length === 0 ? 'Sélectionnez au moins un rôle' : null,
    },
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Échec de la récupération des utilisateurs');
      }

      const data = await res.json();
      setUsers(data);
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Échec de la création');
      }

      notifications.show({
        title: 'Succès',
        message: 'Utilisateur créé avec succès',
        color: 'green',
      });

      form.reset();
      close();
      fetchUsers();
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.message,
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Échec de la suppression');
      }

      notifications.show({
        title: 'Succès',
        message: 'Utilisateur supprimé',
        color: 'green',
      });

      fetchUsers();
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.message,
        color: 'red',
      });
    }
  };

  const isAdmin = currentUser?.roles?.includes('admin');

  if (!isAdmin) {
    return (
      <Paper p="md" shadow="sm" radius="md">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Accès non autorisé"
          color="red"
          variant="light"
        >
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={2}>Gestion des utilisateurs</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={open}>
          Nouvel utilisateur
        </Button>
      </Group>

      <Paper shadow="sm" radius="md" p="md">
        {loading ? (
          <Text c="dimmed">Chargement...</Text>
        ) : users.length === 0 ? (
          <Text c="dimmed">Aucun utilisateur</Text>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Username</Table.Th>
                <Table.Th>Rôles</Table.Th>
                <Table.Th>Créé le</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>{user.username}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {user.roles.map((role) => (
                        <Badge
                          key={role}
                          color={role === 'admin' ? 'red' : 'blue'}
                          variant="light"
                        >
                          {role}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleDelete(user.id, user.username)}
                      disabled={user.username === currentUser?.username}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={opened}
        onClose={() => {
          close();
          form.reset();
        }}
        title="Créer un nouvel utilisateur"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Nom d'utilisateur"
              placeholder="identifiant"
              required
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Mot de passe"
              placeholder="********"
              required
              {...form.getInputProps('password')}
            />
            <MultiSelect
              label="Rôles"
              placeholder="Sélectionnez les rôles"
              data={ROLE_OPTIONS}
              required
              {...form.getInputProps('roles')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={close}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
