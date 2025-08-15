import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  useToast,
  Divider,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Badge,
  Icon,
  Select,
  Textarea,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FiUser,
  FiShield,
  FiBell,
  FiCreditCard,
  FiLayers,
  FiSettings,
  FiKey,
  FiMail,
  FiGlobe,
  FiCheck,
  FiAlertTriangle,
  FiTrash2,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { Layout } from "../components/Layout";
import { Logo } from "../components/Logo";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [dataExport, setDataExport] = useState(false);
  const [apiAccess, setApiAccess] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSave = () => {
    toast({ 
      title: "Settings saved!", 
      status: "success", 
      duration: 2000, 
      isClosable: true 
    });
  };

  const handleDeleteAccount = () => {
    toast({ 
      title: "Account deletion requested", 
      description: "This action cannot be undone. Please contact support.",
      status: "warning", 
      duration: 5000, 
      isClosable: true 
    });
    onClose();
  };

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="brand.primary">Settings</Heading>
          <Box display={{ base: "none", lg: "block" }}>
            <Logo size={80} />
          </Box>
        </Flex>

        <Tabs variant="enclosed" colorScheme="brand">
          <TabList>
            <Tab>
              <Icon as={FiUser} mr={2} />
              Account
            </Tab>
            <Tab>
              <Icon as={FiShield} mr={2} />
              Security
            </Tab>
            <Tab>
              <Icon as={FiBell} mr={2} />
              Notifications
            </Tab>
            <Tab>
              <Icon as={FiLayers} mr={2} />
              Integrations
            </Tab>
            <Tab>
              <Icon as={FiCreditCard} mr={2} />
              Billing
            </Tab>
            <Tab>
              <Icon as={FiSettings} mr={2} />
              Advanced
            </Tab>
          </TabList>

          <TabPanels>
            {/* Account Settings */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Profile Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Email Address</FormLabel>
                        <Input placeholder="your@email.com" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <Input placeholder="Your Full Name" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Company</FormLabel>
                        <Input placeholder="Your Company" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Job Title</FormLabel>
                        <Input placeholder="Your Job Title" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input placeholder="+1 (555) 123-4567" bg="brand.neutral.50" />
                      </FormControl>
                      <Button variant="brand" onClick={handleSave}>
                        Update Profile
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Preferences</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Language</FormLabel>
                        <Select value={language} onChange={(e) => setLanguage(e.target.value)} bg="brand.neutral.50">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Timezone</FormLabel>
                        <Select value={timezone} onChange={(e) => setTimezone(e.target.value)} bg="brand.neutral.50">
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="GMT">GMT</option>
                        </Select>
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Dark Mode</FormLabel>
                        <Switch isChecked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Data Export Access</FormLabel>
                        <Switch isChecked={dataExport} onChange={(e) => setDataExport(e.target.checked)} />
                      </FormControl>
                      <Button variant="brand" onClick={handleSave}>
                        Save Preferences
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Security Settings */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Password & Security</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Current Password</FormLabel>
                        <Input type="password" placeholder="Enter current password" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>New Password</FormLabel>
                        <Input type="password" placeholder="Enter new password" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Confirm New Password</FormLabel>
                        <Input type="password" placeholder="Confirm new password" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Two-Factor Authentication</FormLabel>
                        <Switch isChecked={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.checked)} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Session Timeout</FormLabel>
                        <Select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} bg="brand.neutral.50">
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </Select>
                      </FormControl>
                      <Button variant="brand" onClick={handleSave}>
                        Update Security Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">API Access</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Enable API Access</FormLabel>
                        <Switch isChecked={apiAccess} onChange={(e) => setApiAccess(e.target.checked)} />
                      </FormControl>
                      {apiAccess && (
                        <>
                          <FormControl>
                            <FormLabel>API Key</FormLabel>
                            <Input value="sk-1234567890abcdef" isReadOnly bg="brand.neutral.50" />
                          </FormControl>
                          <HStack spacing={2}>
                            <Button size="sm" variant="outline" leftIcon={<FiKey />}>
                              Regenerate
                            </Button>
                            <Button size="sm" variant="outline" leftIcon={<FiDownload />}>
                              Download
                            </Button>
                          </HStack>
                        </>
                      )}
                      <Alert status="info">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>API Access</AlertTitle>
                          <AlertDescription>
                            Enable API access to integrate with external tools and automate workflows.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Notification Settings */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Email Notifications</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Campaign Updates</FormLabel>
                        <Switch isChecked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Weekly Reports</FormLabel>
                        <Switch isChecked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">System Alerts</FormLabel>
                        <Switch isChecked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Marketing Tips</FormLabel>
                        <Switch isChecked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
                      </FormControl>
                      <Button variant="brand" onClick={handleSave}>
                        Save Email Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Push Notifications</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Campaign Performance</FormLabel>
                        <Switch isChecked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">New Messages</FormLabel>
                        <Switch isChecked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Task Reminders</FormLabel>
                        <Switch isChecked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">System Updates</FormLabel>
                        <Switch isChecked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                      </FormControl>
                      <Button variant="brand" onClick={handleSave}>
                        Save Notification Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Integrations */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Connected Services</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" p={3} bg="green.50" borderRadius="md">
                        <HStack>
                          <Icon as={FiCheck} color="green.500" />
                          <Text fontWeight="medium">Google Analytics</Text>
                        </HStack>
                        <Badge colorScheme="green">Connected</Badge>
                      </HStack>
                      <HStack justify="space-between" p={3} bg="brand.primary.50" borderRadius="md">
                        <HStack>
                          <Icon as={FiCheck} color="brand.primary" />
                          <Text fontWeight="medium">Mailchimp</Text>
                        </HStack>
                        <Badge colorScheme="brand.primary">Connected</Badge>
                      </HStack>
                      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <HStack>
                          <Icon as={FiGlobe} color="gray.500" />
                          <Text fontWeight="medium">Slack</Text>
                        </HStack>
                        <Badge colorScheme="gray">Not Connected</Badge>
                      </HStack>
                      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <HStack>
                          <Icon as={FiGlobe} color="gray.500" />
                          <Text fontWeight="medium">Zapier</Text>
                        </HStack>
                        <Badge colorScheme="gray">Not Connected</Badge>
                      </HStack>
                      <Button variant="brand" onClick={handleSave}>
                        Manage Integrations
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Webhook Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Webhook URL</FormLabel>
                        <Input placeholder="https://your-domain.com/webhook" bg="brand.neutral.50" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Events to Trigger</FormLabel>
                        <Select bg="brand.neutral.50">
                          <option>All Events</option>
                          <option>Campaign Events Only</option>
                          <option>User Events Only</option>
                        </Select>
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Enable Webhooks</FormLabel>
                        <Switch />
                      </FormControl>
                      <Button variant="brand" onClick={handleSave}>
                        Save Webhook Settings
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Billing */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Subscription</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Current Plan</Text>
                        <Badge colorScheme="green" fontSize="md">Professional</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Monthly Cost</Text>
                        <Text fontWeight="medium">$99/month</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Next Billing Date</Text>
                        <Text>March 15, 2024</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Users</Text>
                        <Text>5 of 10</Text>
                      </HStack>
                      <Button variant="brand">
                        Manage Subscription
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Payment Method</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <HStack>
                          <Icon as={FiCreditCard} />
                          <Text>•••• •••• •••• 4242</Text>
                        </HStack>
                        <Badge colorScheme="green">Default</Badge>
                      </HStack>
                      <Button variant="outline">
                        Update Payment Method
                      </Button>
                      <Button variant="outline">
                        View Billing History
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Advanced Settings */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card boxShadow="md">
                  <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
                    <Heading size="md">Data Management</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Button variant="outline" leftIcon={<FiDownload />}>
                        Export All Data
                      </Button>
                      <Button variant="outline" leftIcon={<FiUpload />}>
                        Import Data
                      </Button>
                      <Alert status="warning">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Data Export</AlertTitle>
                          <AlertDescription>
                            Exporting data may take several minutes depending on the amount of data.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>

                <Card boxShadow="md">
                  <CardHeader bg="red.500" color="white" borderTopRadius="md">
                    <Heading size="md">Danger Zone</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Alert status="error">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Account Deletion</AlertTitle>
                          <AlertDescription>
                            Once you delete your account, there is no going back. Please be certain.
                          </AlertDescription>
                        </Box>
                      </Alert>
                      <Button 
                        colorScheme="red" 
                        variant="outline" 
                        leftIcon={<FiTrash2 />}
                        onClick={onOpen}
                      >
                        Delete Account
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Delete Account Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Account</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Warning!</AlertTitle>
                    <AlertDescription>
                      This action cannot be undone. All your data will be permanently deleted.
                    </AlertDescription>
                  </Box>
                </Alert>
                <Text>
                  Please type "DELETE" to confirm that you want to permanently delete your account.
                </Text>
                <Input placeholder="Type DELETE to confirm" />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Layout>
  );
} 