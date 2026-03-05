import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Alert,
  Center,
  Modal,
  Stack,
  MultiSelect,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconLock,
  IconAlertCircle,
  IconUserPlus,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [registerOpened, { open: openRegister, close: closeRegister }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value ? null : "Nom d'utilisateur requis"),
      password: (value) => (value ? null : 'Mot de passe requis'),
    },
  });

  const registerForm = useForm({
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

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: typeof registerForm.values) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Échec de la création');
      }

      notifications.show({
        title: 'Succès',
        message: 'Compte créé ! Connectez-vous maintenant.',
        color: 'green',
      });

      registerForm.reset();
      closeRegister();
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.message,
        color: 'red',
      });
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Center mb="xl">
        <Box
          p="md"
          style={{
            backgroundColor: 'var(--mantine-color-blue-6)',
            borderRadius: '50%',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <IconLock size={32} />
        </Box>
      </Center>

      <Paper withBorder shadow="xl" p={30} radius="md" style={{ backgroundColor: 'white', maxWidth: 420, width: '100%' }}>
        <Title ta="center" order={1} mb={4} style={{ fontWeight: 900 }}>
          SESA Admin
        </Title>
        <Text ta="center" c="dimmed" size="sm" mb={30}>
          Connectez-vous pour gérer les registres du Sekoly Sabata
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          {error && (
            <Alert icon={<IconAlertCircle size={20} />} color="red" mb="md" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label="Nom d'utilisateur"
            placeholder="votre_identifiant"
            required
            mb="md"
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            required
            mb="lg"
            {...form.getInputProps('password')}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading} size="md">
            Se connecter
          </Button>

          <Button
            fullWidth
            mt="sm"
            variant="outline"
            color="gray"
            leftSection={<IconUserPlus size={18} />}
            onClick={openRegister}
          >
            Créer un compte
          </Button>

          <Box mt="xl" ta="center" c="dimmed" fz="xs" p="xs" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <Text span fw={700}>Accès de test</Text> : raberia / random123
          </Box>
        </form>
      </Paper>

      <Modal
        opened={registerOpened}
        onClose={() => {
          closeRegister();
          registerForm.reset();
        }}
        title="Créer un compte"
        centered
      >
        <form onSubmit={registerForm.onSubmit(handleRegister)}>
          <Stack>
            <TextInput
              label="Nom d'utilisateur"
              placeholder="identifiant"
              required
              {...registerForm.getInputProps('username')}
            />
            <PasswordInput
              label="Mot de passe"
              placeholder="********"
              required
              {...registerForm.getInputProps('password')}
            />
            <MultiSelect
              label="Rôles"
              placeholder="Sélectionnez les rôles"
              data={[
                { value: 'admin', label: 'Administrateur' },
                { value: 'user', label: 'Utilisateur' },
              ]}
              required
              {...registerForm.getInputProps('roles')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeRegister}>
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
