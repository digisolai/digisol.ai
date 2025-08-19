import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Container,
  Divider,
  Button,
  Link,
  useColorModeValue,
  Grid,
  GridItem,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiMessageSquare,
  FiClock,
  FiUsers,
  FiAward,
  FiShield,
  FiZap,
} from "react-icons/fi";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";

const ContactUsPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email",
      value: "admin@digisolai.ca",
      description: "Send us an email anytime",
      link: "mailto:admin@digisolai.ca",
    },
    {
      icon: FiPhone,
      title: "Phone",
      value: "+1 (587) 577-0782",
      description: "Mon-Fri from 9am to 5pm MST",
      link: "tel:+15875770782",
    },
    {
      icon: FiMapPin,
      title: "Office",
      value: "Box 1764, Carstairs, Alberta T0M 0N0",
      description: "Headquartered in the heart of Alberta",
    },
    {
      icon: FiGlobe,
      title: "Website",
      value: "www.digisolai.ca",
      description: "Visit our main website",
      link: "https://www.digisolai.ca",
    },
  ];

  const socialMediaLinks = [
    {
      icon: FaFacebook,
      name: "Facebook",
      url: "https://facebook.com/digisolai",
      color: "#1877F2",
      description: "Follow us on Facebook",
    },
    {
      icon: FaTwitter,
      name: "Twitter",
      url: "https://twitter.com/digisolai",
      color: "#1DA1F2",
      description: "Follow us on Twitter",
    },
    {
      icon: FaLinkedin,
      name: "LinkedIn",
      url: "https://linkedin.com/company/digisolai",
      color: "#0077B5",
      description: "Connect with us on LinkedIn",
    },
  ];

  const businessHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 5:00 PM MST" },
    { day: "Saturday", hours: "10:00 AM - 2:00 PM MST" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-r, #1F4287, #1F4287)"
        color="white"
        py={20}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              maxW="3xl"
              textAlign="center"
              mx="auto"
              color="white"
            >
              Get in Touch with{" "}
              <Text as="span" color="#FFC300">
                DigiSol.AI
              </Text>
            </Heading>
            <Text fontSize="xl" maxW="2xl" color="#FFC300">
              Ready to transform your marketing with AI? We're here to help you get started 
              and answer any questions about our platform.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Contact Information */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={16}>
          {/* Contact Cards */}
          <Box w="full">
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="#1F4287">
                  Contact Information
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="2xl">
                  Reach out to us through any of these channels. We're here to help you 
                  succeed with AI-powered marketing.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
                {contactInfo.map((contact, index) => (
                  <Card key={index} bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardBody textAlign="center">
                      <VStack spacing={4}>
                        <Box
                          p={3}
                          borderRadius="full"
                          bg="#1F4287"
                          color="#FFC300"
                        >
                          <Icon as={contact.icon} boxSize={6} />
                        </Box>
                        <VStack spacing={2}>
                          <Heading size="md" color="#1F4287">
                            {contact.title}
                          </Heading>
                          {contact.link ? (
                            <Link
                              href={contact.link}
                              color="blue.500"
                              _hover={{ color: "blue.600" }}
                              fontWeight="medium"
                            >
                              {contact.value}
                            </Link>
                          ) : (
                            <Text fontWeight="medium" color="gray.700">
                              {contact.value}
                            </Text>
                          )}
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            {contact.description}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          <Divider />

          {/* Social Media */}
          <Box w="full">
            <VStack spacing={8}>
              <VStack spacing={4} textAlign="center">
                <Heading size="lg" color="#1F4287">
                  Follow Us on Social Media
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="2xl">
                  Stay updated with the latest AI marketing trends, tips, and DigiSol.AI news.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                {socialMediaLinks.map((social, index) => (
                  <Card key={index} bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardBody textAlign="center">
                      <VStack spacing={4}>
                        <Box
                          p={4}
                          borderRadius="full"
                          bg={social.color}
                          color="white"
                        >
                          <Icon as={social.icon} boxSize={8} />
                        </Box>
                        <VStack spacing={2}>
                          <Heading size="md" color="#1F4287">
                            {social.name}
                          </Heading>
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            {social.description}
                          </Text>
                          <Button
                            as={Link}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            _hover={{ bg: social.color, color: "white" }}
                          >
                            Follow Us
                          </Button>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>

          <Divider />

          {/* Business Hours and Additional Info */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={12} w="full">
            {/* Business Hours */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                                     <HStack spacing={3}>
                     <Icon as={FiClock} color="#FFC300" boxSize={6} />
                     <Heading size="md" color="#1F4287">
                       Business Hours
                     </Heading>
                   </HStack>
                  <List spacing={3}>
                    {businessHours.map((schedule, index) => (
                      <ListItem key={index}>
                        <HStack justify="space-between">
                          <Text fontWeight="medium" color="gray.700">
                            {schedule.day}
                          </Text>
                          <Text color="gray.500">
                            {schedule.hours}
                          </Text>
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </VStack>
              </CardBody>
            </Card>

            {/* Why Choose DigiSol.AI */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                                     <HStack spacing={3}>
                     <Icon as={FiAward} color="#FFC300" boxSize={6} />
                     <Heading size="md" color="#1F4287">
                       Why Choose DigiSol.AI?
                     </Heading>
                   </HStack>
                  <VStack spacing={4} align="stretch">
                                         <HStack spacing={3}>
                       <Icon as={FiZap} color="#FFC300" boxSize={5} />
                       <Text fontSize="sm" color="gray.600">
                         AI-powered marketing automation
                       </Text>
                     </HStack>
                     <HStack spacing={3}>
                       <Icon as={FiUsers} color="#FFC300" boxSize={5} />
                       <Text fontSize="sm" color="gray.600">
                         Expert support and guidance
                       </Text>
                     </HStack>
                     <HStack spacing={3}>
                       <Icon as={FiShield} color="#FFC300" boxSize={5} />
                       <Text fontSize="sm" color="gray.600">
                         Enterprise-grade security
                       </Text>
                     </HStack>
                     <HStack spacing={3}>
                       <Icon as={FiMessageSquare} color="#FFC300" boxSize={5} />
                       <Text fontSize="sm" color="gray.600">
                         Personalized onboarding experience
                       </Text>
                     </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* CTA Section */}
          <Box w="full" textAlign="center">
            <VStack spacing={6}>
              <Heading size="lg" color="#1F4287">
                Ready to Get Started?
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Join thousands of marketers who are already using AI to transform their campaigns.
              </Text>
              <HStack spacing={4}>
                <Button
                  size="lg"
                  bg="#1F4287"
                  color="#FFC300"
                  _hover={{ bg: "#163a6f" }}
                  as={Link}
                  href="/signup"
                >
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  color="#1F4287"
                  borderColor="#1F4287"
                  _hover={{ bg: "#1F4287", color: "white" }}
                  as={Link}
                  href="/about"
                >
                  Learn More
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ContactUsPage;
