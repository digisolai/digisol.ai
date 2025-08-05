import {useEffect, useState} from "react";
import {

  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  Button,

  VStack,
  Spinner,

} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { PageLayout, SectionCard, SideCard } from "../components/PageLayout";
import { useAuth } from "../hooks/useAuth";

interface DashboardSummary {
  active_campaigns: number;
  next_scheduled: string;
  total_emails_sent: number;
  recent_leads: { name: string; email: string; date: string }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Placeholder: Replace with real API call when available
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        // const res = await api.get("/reports/dashboard-summary/");
        // setSummary(res.data);
        // Placeholder data:
        setTimeout(() => {
          setSummary({
            active_campaigns: 3,
            next_scheduled: "2024-07-01",
            total_emails_sent: 12450,
            recent_leads: [
              { name: "Jane Doe", email: "jane@example.com", date: "2024-06-10" },
              { name: "John Smith", email: "john@example.com", date: "2024-06-09" },
              { name: "Alice Lee", email: "alice@example.com", date: "2024-06-08" },
            ],
          });
          setLoading(false);
        }, 800);
      } catch {
        setError("Failed to load dashboard summary.");
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  // const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Layout>
      <PageLayout
        title={`Welcome${user?.name ? `, ${user.name}` : user?.email ? `, ${user.email}` : ""}!`}
        centerColumn={
          <SectionCard title="Dashboard Overview">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Campaigns at a Glance */}
              <Card boxShadow="md">
                <CardHeader bg="brand.primary" color="white" borderTopRadius="md" py={3}>
                  <Heading size="md">Campaigns at a Glance</Heading>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Spinner />
                  ) : error ? (
                    <Text color="red.500">{error}</Text>
                  ) : summary ? (
                    <SimpleGrid columns={1} spacing={3}>
                      <Stat>
                        <StatLabel>Active Campaigns</StatLabel>
                        <StatNumber color="brand.accent">{summary.active_campaigns}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Next Scheduled</StatLabel>
                        <StatNumber color="brand.accent">{summary.next_scheduled}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Emails Sent</StatLabel>
                        <StatNumber color="brand.accent">{summary.total_emails_sent}</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  ) : null}
                </CardBody>
              </Card>

              {/* Recent Leads/Conversions */}
              <Card boxShadow="md">
                <CardHeader bg="brand.primary" color="white" borderTopRadius="md" py={3}>
                  <Heading size="md">Recent Leads / Conversions</Heading>
                </CardHeader>
                <CardBody>
                  {loading ? (
                    <Spinner />
                  ) : error ? (
                    <Text color="red.500">{error}</Text>
                  ) : summary && summary.recent_leads.length > 0 ? (
                    <List spacing={2}>
                      {summary.recent_leads.map((lead, idx) => (
                        <ListItem key={idx} borderBottom="1px solid" borderColor="brand.neutral.100" py={1}>
                          <Text fontWeight="bold">{lead.name}</Text>
                          <Text fontSize="sm" color="brand.neutral.400">{lead.email} &bull; {lead.date}</Text>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Text color="brand.neutral.300">No recent leads.</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </SectionCard>
        }
        rightColumn={
          <>
            <SideCard title="Quick Actions">
              <VStack spacing={4}>
                <Button 
                  bg="brand.primary" 
                  color="brand.accent" 
                  fontWeight="bold" 
                  as="a" 
                  href="/campaigns" 
                  _hover={{ bg: "#1a365d" }}
                  size="lg"
                  width="full"
                >
                  Create New Campaign
                </Button>
                <Button 
                  bg="brand.primary" 
                  color="brand.accent" 
                  fontWeight="bold" 
                  as="a" 
                  href="/contacts" 
                  _hover={{ bg: "#1a365d" }}
                  size="lg"
                  width="full"
                >
                  Add Contacts
                </Button>
                <Button 
                  bg="brand.primary" 
                  color="brand.accent" 
                  fontWeight="bold" 
                  as="a" 
                  href="/reports" 
                  _hover={{ bg: "#1a365d" }}
                  size="lg"
                  width="full"
                >
                  View Reports
                </Button>
              </VStack>
            </SideCard>

            <SideCard title="Account Info">
              <VStack spacing={3} align="start">
                <Text fontSize="sm" color="gray.600">
                  <strong>User:</strong> {user?.name || user?.email}
                </Text>
                {user?.tenant_id && (
                  <Text fontSize="sm" color="gray.600">
                    <strong>Tenant:</strong> {user.tenant_id}
                  </Text>
                )}
              </VStack>
            </SideCard>
          </>
        }
        showLeftColumn={false}
      />
    </Layout>
  );
} 