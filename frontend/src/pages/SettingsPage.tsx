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
} from "@chakra-ui/react";
import { Layout } from "../components/Layout";
import { Logo } from "../components/Logo";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    toast({ title: "Settings saved!", status: "success", duration: 2000, isClosable: true });
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

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Account Settings */}
          <Card boxShadow="md">
            <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
              <Heading size="md">Account Settings</Heading>
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
                <Button variant="brand" onClick={handleSave}>
                  Update Account
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Preferences */}
          <Card boxShadow="md">
            <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
              <Heading size="md">Preferences</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Push Notifications</FormLabel>
                  <Switch isChecked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Email Updates</FormLabel>
                  <Switch isChecked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Dark Mode</FormLabel>
                  <Switch isChecked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                </FormControl>
                <Button variant="brand" onClick={handleSave}>
                  Save Preferences
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Security */}
          <Card boxShadow="md">
            <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
              <Heading size="md">Security</Heading>
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
                <Button variant="brand" onClick={handleSave}>
                  Change Password
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Billing */}
          <Card boxShadow="md">
            <CardHeader bg="brand.primary" color="white" borderTopRadius="md">
              <Heading size="md">Billing & Subscription</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" color="brand.primary">Current Plan</Text>
                  <Text fontSize="lg" color="brand.accent">Professional</Text>
                  <Text fontSize="sm" color="brand.neutral.500">$99/month</Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold" color="brand.primary">Next Billing Date</Text>
                  <Text>July 1, 2024</Text>
                </Box>
                <Button variant="brand">
                  Manage Subscription
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </Layout>
  );
} 