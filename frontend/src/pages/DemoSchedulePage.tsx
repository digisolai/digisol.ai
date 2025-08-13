import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function DemoSchedulePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    preferredDate: "",
    preferredTime: "",
    teamSize: "",
    useCase: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const bgColor = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual demo scheduling API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Demo Scheduled!",
        description: "We'll contact you within 24 hours to confirm your demo appointment.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule demo. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg={bgColor} borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <Logo />
            <Button variant="ghost" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.lg" py={12}>
        <VStack spacing={8}>
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="brand.primary">
              Schedule Your Personalized Demo
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              See how DigiSol.AI can transform your marketing operations. 
              Our team will walk you through the platform and answer all your questions.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
            {/* Demo Benefits */}
            <VStack spacing={6} align="start">
              <Heading size="md" color="brand.primary">
                What You'll See in Your Demo
              </Heading>
              
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Icon as={FiUser} color="brand.primary" boxSize={5} />
                  <Text>Personalized platform walkthrough</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiMessageSquare} color="brand.primary" boxSize={5} />
                  <Text>Live Q&A with our experts</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiCalendar} color="brand.primary" boxSize={5} />
                  <Text>30-minute focused session</Text>
                </HStack>
                <HStack spacing={3}>
                  <Icon as={FiClock} color="brand.primary" boxSize={5} />
                  <Text>No sales pressure - just education</Text>
                </HStack>
              </VStack>

              <Card bg={cardBg} w="full">
                <CardBody>
                  <VStack spacing={3} align="start">
                    <Heading size="sm" color="brand.primary">
                      Demo Includes:
                    </Heading>
                    <Text fontSize="sm">• AI-powered campaign creation</Text>
                    <Text fontSize="sm">• Automated workflow setup</Text>
                    <Text fontSize="sm">• Analytics and reporting</Text>
                    <Text fontSize="sm">• Design studio features</Text>
                    <Text fontSize="sm">• Integration capabilities</Text>
                    <Text fontSize="sm">• Pricing and next steps</Text>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>

            {/* Demo Form */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Company</FormLabel>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Enter your company name"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Preferred Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select
                        value={formData.preferredTime}
                        onChange={(e) => handleInputChange("preferredTime", e.target.value)}
                        placeholder="Select preferred time"
                      >
                        <option value="9:00 AM">9:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Team Size</FormLabel>
                      <Select
                        value={formData.teamSize}
                        onChange={(e) => handleInputChange("teamSize", e.target.value)}
                        placeholder="Select team size"
                      >
                        <option value="1-5">1-5 people</option>
                        <option value="6-20">6-20 people</option>
                        <option value="21-50">21-50 people</option>
                        <option value="51-100">51-100 people</option>
                        <option value="100+">100+ people</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Primary Use Case</FormLabel>
                      <Select
                        value={formData.useCase}
                        onChange={(e) => handleInputChange("useCase", e.target.value)}
                        placeholder="Select primary use case"
                      >
                        <option value="email-marketing">Email Marketing</option>
                        <option value="social-media">Social Media Management</option>
                        <option value="content-creation">Content Creation</option>
                        <option value="analytics">Analytics & Reporting</option>
                        <option value="automation">Marketing Automation</option>
                        <option value="design">Design & Branding</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Additional Information</FormLabel>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Tell us about your specific needs or questions..."
                        rows={4}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      w="full"
                      isLoading={isSubmitting}
                      loadingText="Scheduling Demo..."
                    >
                      Schedule My Demo
                    </Button>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      By scheduling a demo, you agree to receive communications from DigiSol.AI.
                      You can unsubscribe at any time.
                    </Text>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
