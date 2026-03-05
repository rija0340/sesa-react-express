import { useState, useEffect, useMemo } from 'react';
import {
  Title,
  Text,
  Group,
  Box,
  Paper,
  RingProgress,
  SimpleGrid,
  Card,
  Table,
  ScrollArea,
  Badge,
  Loader,
  Alert,
  SegmentedControl,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';

dayjs.extend(quarterOfYear);
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
  mambraTonga: number;
  mpamangy: number;
  tongaRehetra: number;
  nianatraImpito: number;
  fanatitra: number;
  createdAt: string;
  kilasyId: number;
}

export default function Dashboard() {
  const [kilasys, setKilasys] = useState<Kilasy[]>([]);
  const [registres, setRegistres] = useState<Registre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('quarter');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [kRes, rRes] = await Promise.all([
        fetch('/api/kilasy', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('/api/registres', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      if (!kRes.ok || !rRes.ok) {
        throw new Error('Erreur de chargement des données');
      }

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

  const filteredRegistres = useMemo(() => {
    if (period === 'all') return registres;

    const now = dayjs();
    let start;
    if (period === 'quarter') {
      start = now.startOf('quarter');
    } else {
      start = now.startOf('year');
    }

    return registres.filter((r) => {
      const d = dayjs(r.createdAt);
      return d.isAfter(start) || d.isSame(start);
    });
  }, [registres, period]);

  const totalKilasy = kilasys.length;
  const totalRegistres = filteredRegistres.length;

  const recentRegistres = [...filteredRegistres]
    .sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix())
    .slice(0, 5);

  const stats = useMemo(() => {
    if (filteredRegistres.length === 0) {
      return { avgPresence: 0, avgApprentissage: 0, totalOffrande: 0 };
    }

    const totalPresents = filteredRegistres.reduce((sum, r) => sum + r.mambraTonga, 0);
    const totalLearners = filteredRegistres.reduce((sum, r) => sum + r.nianatraImpito, 0);
    const totalAll = filteredRegistres.reduce((sum, r) => sum + r.tongaRehetra, 0);
    const totalOffrande = filteredRegistres.reduce((sum, r) => sum + r.fanatitra, 0);

    return {
      avgPresence: totalAll > 0 ? Math.round((totalPresents / totalAll) * 100) : 0,
      avgApprentissage: totalAll > 0 ? Math.round((totalLearners / totalAll) * 100) : 0,
      totalOffrande,
    };
  }, [filteredRegistres]);

  return (
    <Box>
      <Group justify="space-between" align="center" mb="xl">
        <Box>
          <Title order={2} mb="xs">
            Tableau de bord
          </Title>
          <Text c="dimmed">
            Vue d'ensemble du Sekoly Sabata
          </Text>
        </Box>

        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={5} tt="uppercase" ta="right">Période d'affichage</Text>
          <SegmentedControl
            value={period}
            onChange={(val) => setPeriod(val)}
            data={[
              { label: 'Trimestre', value: 'quarter' },
              { label: 'Année', value: 'year' },
              { label: 'Tout', value: 'all' },
            ]}
          />
        </Box>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={20} />} color="red" mb="lg" title="Erreur de chargement">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </Box>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg" mb="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Classes
              </Text>
              <Group justify="space-between" mt="md" align="flex-end">
                <Box>
                  <Text size="xl" fw={800} style={{ fontSize: 32, lineHeight: 1 }}>
                    {totalKilasy}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Kilasy enregistrées
                  </Text>
                </Box>
                <RingProgress
                  size={60}
                  thickness={5}
                  roundCaps
                  sections={[{ value: Math.min(totalKilasy, 100), color: 'indigo' }]}
                />
              </Group>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Registres
              </Text>
              <Group justify="space-between" mt="md" align="flex-end">
                <Box>
                  <Text size="xl" fw={800} style={{ fontSize: 32, lineHeight: 1 }}>
                    {totalRegistres}
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Entrées totales
                  </Text>
                </Box>
                <RingProgress
                  size={60}
                  thickness={5}
                  roundCaps
                  sections={[{ value: Math.min(totalRegistres, 100), color: 'cyan' }]}
                />
              </Group>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Présence
              </Text>
              <Group justify="space-between" mt="md" align="flex-end">
                <Box>
                  <Text size="xl" fw={800} style={{ fontSize: 32, lineHeight: 1 }}>
                    {stats.avgPresence}%
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Moyenne %
                  </Text>
                </Box>
                <RingProgress
                  size={60}
                  thickness={5}
                  roundCaps
                  sections={[{ value: stats.avgPresence, color: 'teal' }]}
                />
              </Group>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Offrande
              </Text>
              <Group justify="space-between" mt="md" align="flex-end">
                <Box>
                  <Text size="xl" fw={800} style={{ fontSize: 32, lineHeight: 1 }}>
                    {stats.totalOffrande.toLocaleString('fr-FR')} Ar
                  </Text>
                  <Text size="sm" c="dimmed" mt={4}>
                    Total sur la période
                  </Text>
                </Box>
                <RingProgress
                  size={60}
                  thickness={5}
                  roundCaps
                  sections={[{ value: Math.min((stats.totalOffrande / 100000) * 100, 100), color: 'yellow' }]}
                />
              </Group>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Paper shadow="sm" radius="md" p="xl" withBorder>
              <Text fw={600} mb="md">
                Derniers registres
              </Text>
              {recentRegistres.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Aucun registre enregistré pour le moment.
                </Text>
              ) : (
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Classe</Table.Th>
                        <Table.Th>Présents</Table.Th>
                        <Table.Th>Offrande</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {recentRegistres.map((r) => (
                        <Table.Tr key={r.id}>
                          <Table.Td>{formatDate(r.createdAt)}</Table.Td>
                          <Table.Td>{getKilasyName(r.kilasyId)}</Table.Td>
                          <Table.Td>
                            <Badge variant="light" color="indigo" size="sm">
                              {r.mambraTonga}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {Number(r.fanatitra).toLocaleString('fr-FR')} Ar
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              )}
            </Paper>

            <Paper shadow="sm" radius="md" p="xl" withBorder>
              <Text fw={600} mb="md">
                Aperçu des classes
              </Text>
              {kilasys.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Aucune classe créée pour le moment.
                </Text>
              ) : (
                <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {kilasys.map((k) => {
                    const count = registres.filter((r) => r.kilasyId === k.id).length;
                    return (
                      <Paper key={k.id} p="sm" radius="sm" withBorder>
                        <Group justify="space-between">
                          <Box>
                            <Text size="sm" fw={600}>
                              {k.nom}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {k.description || 'Pas de description'}
                            </Text>
                          </Box>
                          <Group gap="xs">
                            <Badge variant="light" color="indigo" size="sm">
                              {k.nbrMambra ?? '—'} membres
                            </Badge>
                            <Badge variant="dot" color="gray" size="sm">
                              {count} registre{count > 1 ? 's' : ''}
                            </Badge>
                          </Group>
                        </Group>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </SimpleGrid>
        </>
      )}
    </Box>
  );
}
