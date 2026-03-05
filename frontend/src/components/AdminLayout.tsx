import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';

import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  ScrollArea,
  Box,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLayoutDashboard,
  IconSchool,
  IconClipboardList,
  IconChartBar,
  IconSun,
  IconMoon,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: IconLayoutDashboard, path: '/' },
  { label: 'Kilasy', icon: IconSchool, path: '/kilasy' },
  { label: 'Modèles', icon: IconClipboardList, path: '/kilasy-lasitra' },
  { label: 'Registre', icon: IconClipboardList, path: '/registre' },
  { label: 'Statistiques', icon: IconChartBar, path: '/stats' },
  { label: 'Utilisateurs', icon: IconUsers, path: '/users' },
];

const ICON_SIZE = 22;

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopCollapsed, { toggle: toggleDesktop }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navbarWidth = desktopCollapsed ? 80 : 260;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
      transitionDuration={300}
      transitionTimingFunction="ease"
    >
      <AppShell.Header
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          backdropFilter: 'blur(12px)',
          backgroundColor:
            colorScheme === 'dark'
              ? 'rgba(26, 27, 30, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Text
              size="xl"
              fw={800}
              style={{ cursor: 'pointer', letterSpacing: '-0.5px' }}
              onClick={() => navigate('/')}
            >
              SESA Admin
            </Text>
          </Group>

          <Group>
            <Tooltip label={colorScheme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => toggleColorScheme()}
                aria-label="Changer le thème"
              >
                {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="sm"
        style={{
          borderRight: '1px solid var(--mantine-color-default-border)',
          transition: 'width 300ms ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <AppShell.Section grow component={ScrollArea} scrollbarSize={4}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                label={desktopCollapsed ? undefined : item.label}
                leftSection={<item.icon size={ICON_SIZE} />}
                active={location.pathname === item.path}
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  justifyContent: desktopCollapsed ? 'center' : undefined,
                }}
              />
            ))}
          </Box>
        </AppShell.Section>

        <AppShell.Section>
          <Box
            style={{
              borderTop: '1px solid var(--mantine-color-default-border)',
              paddingTop: 12,
              paddingBottom: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Box
              p="xs"
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: 'var(--mantine-color-gray-0)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                overflow: 'hidden',
                justifyContent: desktopCollapsed ? 'center' : 'flex-start',
              }}
            >
              <Box
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: 'var(--mantine-color-indigo-1)',
                  color: 'var(--mantine-color-indigo-7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconUser size={20} stroke={2} />
              </Box>
              {!desktopCollapsed && (
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>{user?.username || 'Administrateur'}</Text>
                  <Text size="xs" c="dimmed" truncate>{user?.roles?.[0] || 'Utilisateur'}</Text>
                </Box>
              )}
            </Box>

            <Group grow={!desktopCollapsed} gap={8} h={40} align="center">
              <Tooltip label="Se déconnecter" position="right">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="lg"
                  onClick={handleLogout}
                  style={{ width: desktopCollapsed ? '100%' : 'auto' }}
                >
                  <IconLogout size={20} />
                </ActionIcon>
              </Tooltip>
              {!desktopCollapsed && (
                <Tooltip label="Réduire le menu" position="right">
                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={toggleDesktop}
                    aria-label="Toggle sidebar"
                  >
                    <IconChevronLeft size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
              {desktopCollapsed && (
                <Tooltip label="Ouvrir le menu" position="right">
                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={toggleDesktop}
                    aria-label="Toggle sidebar"
                  >
                    <IconChevronRight size={20} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main><Outlet /></AppShell.Main>
    </AppShell>
  );
}
