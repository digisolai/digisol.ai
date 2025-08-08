import {useEffect, useState} from "react";
import { Link } from "react-router-dom";
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
  Box,
  Grid,
  GridItem,
  HStack,
  Icon,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { PageLayout, SectionCard, SideCard } from "../components/PageLayout";
import { useAuth } from "../hooks/useAuth";
import {
  FiMail,
  FiUsers,
  FiBarChart2,
  FiZap,
  FiImage,
  FiCpu,
  FiDollarSign,
  FiBookOpen,
  FiLayers,
  FiFileText,
  FiCheckCircle,
  FiInfo,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";

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
    // Simulate loading dashboard data
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
    }, 1000);
  }, []);

  const features = [
    { name: 'AI Agents', icon: FiCpu, available: true },
    { name: 'Campaigns', icon: FiMail, available: true },
    { name: 'Contacts', icon: FiUsers, available: true },
    { name: 'Design Studio', icon: FiImage, available: true },
    { name: 'Analytics', icon: FiBarChart2, available: true },
    { name: 'Automations', icon: FiZap, available: true },
    { name: 'Budgeting', icon: FiDollarSign, available: true },
    { name: 'Learning', icon: FiBookOpen, available: true },
    { name: 'Integrations', icon: FiLayers, available: true },
    { name: 'Templates', icon: FiFileText, available: true },
  ];

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        {/* Welcome Header */}
        <Box mb={6}>
          <Heading size="lg" color="brand.primary" mb={2}>
            Welcome{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email}` : ""}!
          </Heading>
          <Text color="gray.600">Here's what's happening with your marketing today</Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Main Content Column */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Dashboard Overview */}
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
                      ) : summary ? (
                        <List spacing={3}>
                          {summary.recent_leads.map((lead, index) => (
                            <ListItem key={index}>
                              <Box>
                                <Text fontWeight="bold">{lead.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {lead.email} • {lead.date}
                                </Text>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      ) : null}
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </SectionCard>

              {/* Quick Actions */}
              <SectionCard title="Quick Actions">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                     <Button 
                     bg="brand.primary" 
                     color="white" 
                     fontWeight="bold" 
                     as={Link}
                     to="/campaigns" 
                     _hover={{ bg: "brand.600" }}
                     size="lg"
                     leftIcon={<FiPlus />}
                     rightIcon={<FiArrowRight />}
                   >
                     New Campaign
                   </Button>
                   <Button 
                     bg="brand.primary" 
                     color="white" 
                     fontWeight="bold" 
                     as={Link}
                     to="/contacts" 
                     _hover={{ bg: "brand.600" }}
                     size="lg"
                     leftIcon={<FiPlus />}
                     rightIcon={<FiArrowRight />}
                   >
                     Add Contacts
                   </Button>
                   <Button 
                     bg="brand.primary" 
                     color="white" 
                     fontWeight="bold" 
                     as={Link}
                     to="/reports" 
                     _hover={{ bg: "brand.600" }}
                     size="lg"
                     leftIcon={<FiBarChart2 />}
                     rightIcon={<FiArrowRight />}
                   >
                     View Reports
                   </Button>
                </SimpleGrid>
              </SectionCard>
            </VStack>
          </GridItem>

          {/* Right Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Account Info */}
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

              {/* Compact Feature Overview */}
              <SideCard title="Feature Overview">
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    All features are available for exploration. Upgrade for higher limits.
                  </Text>
                  
                                     <SimpleGrid columns={2} spacing={2}>
                     {features.map((feature) => (
                       <HStack 
                         key={feature.name}
                         p={2}
                         bg="brand.50"
                         borderRadius="md"
                         border="1px solid"
                         borderColor="brand.200"
                         spacing={2}
                       >
                         <Icon 
                           as={feature.icon} 
                           color="brand.primary" 
                           boxSize={4} 
                         />
                         <Text fontSize="xs" fontWeight="medium" color="brand.primary">
                           {feature.name}
                         </Text>
                         <Badge bg="brand.accent" color="brand.primary" size="xs">
                           ✓
                         </Badge>
                       </HStack>
                     ))}
                   </SimpleGrid>
                  
                  <Divider />
                  
                                     <Box p={3} bg="brand.50" borderRadius="md" border="1px solid" borderColor="brand.accent">
                     <HStack spacing={2} mb={1}>
                       <Icon as={FiInfo} color="brand.accent" boxSize={4} />
                       <Text fontSize="sm" fontWeight="bold" color="brand.primary">
                         Upgrade Available
                       </Text>
                     </HStack>
                     <Text fontSize="xs" color="brand.primary">
                       Remove limits and get priority support with paid plans.
                     </Text>
                   </Box>
                </VStack>
              </SideCard>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Layout>
  );
} 