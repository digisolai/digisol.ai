import {useEffect, useState} from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  ButtonGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Checkbox,
  Divider,
} from "@chakra-ui/react";
import {FiPlus, FiXCircle} from "react-icons/fi";
import { Layout } from "../components/Layout";
import { AIAgentSection } from "../components/AIAgentSection";
import TagInput from "../components/TagInput"; // Assuming this component exists
import api from "../services/api";
import type { AIProfile } from "../types/ai";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  job_title?: string;
  lead_source?: string;
  lead_status?: string;
  last_contact_date?: string; // Storing as string to handle date input type
  notes?: string;
  tags?: string[];
  priority?: string;
  score?: number;
  last_activity_summary?: string; // AI-generated, read-only
  next_action_suggestion?: string; // AI-generated, read-only
  suggested_persona?: string; // AI-generated, read-only
  created_at?: string;
  updated_at?: string;
  // Lead assignment fields
  assigned_to_user?: string | null;
  assigned_to_department?: string | null;
  assigned_to_team?: string | null;
  assigned_to_user_name?: string | null;
  assigned_to_department_name?: string | null;
  assigned_to_team_name?: string | null;
}

// Interface for the simplified Create Contact form data
interface CreateContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  job_title?: string;
  lead_source?: string;
}

// Initial state for the simplified create contact form
const initialCreateContactFormState: CreateContactFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  company: "",
  job_title: "",
  lead_source: "",
};

// Lead source options for dropdowns
const LEAD_SOURCE_OPTIONS = [
  "Website Form",
  "Referral",
  "Cold Outreach",
  "Event/Webinar",
  "Social Media",
  "Partnership",
  "Direct Mail",
  "Paid Ad",
  "Other",
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingAIInsights, setGeneratingAIInsights] = useState<string | null>(null); // Track which contact is generating insights
  const [chatTranscriptInput, setChatTranscriptInput] = useState(""); // State for chat transcript input

  // State for AI Agent (Prospero)
  const [prosperoAgent, setProsperoAgent] = useState<AIProfile | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);

  // State for Create Contact Form
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [newContactForm, setNewContactForm] = useState<CreateContactFormData>(initialCreateContactFormState);

  // State for Edit Contact Modal
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({}); // Full form for editing
  
  // State for Data Gaps
  const [dataGaps, setDataGaps] = useState<Array<{ field: string; message: string; }>>([]);
  const [loadingGaps, setLoadingGaps] = useState(false);

  // State for Duplicate Detection
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  // State for Merge Selection and Modal
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [masterContactId, setMasterContactId] = useState<string | null>(null);
  const { isOpen: isMergeConfirmModalOpen, onOpen: onMergeConfirmModalOpen, onClose: onMergeConfirmModalClose } = useDisclosure();
  const [mergePreview, setMergePreview] = useState<any>(null); // Changed to any to accommodate mock data
  const [merging, setMerging] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchContacts();
    fetchProsperoAgent();
    fetchDuplicates();
  }, []);

  // --- Agent Fetching ---
  async function fetchProsperoAgent() {
    setLoadingAgent(true);
    setAgentError(null);
    try {
      const res = await api.get('/ai-services/profiles/?specialization=lead_nurturing&is_global=true');
      if (res.data && res.data.length > 0) {
        setProsperoAgent(res.data[0]);
      } else {
        setProsperoAgent({
          id: "prospero",
          name: "Prospero",
          specialization: "lead_nurturing",
          personality_description: "A lead nurturing specialist who develops personalized engagement strategies to convert prospects into customers through targeted communication.",
          is_active: true
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch Prospero agent:", err);
      setAgentError("Failed to load AI assistant");
      setProsperoAgent({
        id: "prospero",
        name: "Prospero",
        specialization: "lead_nurturing",
        personality_description: "A lead nurturing specialist who develops personalized engagement strategies to convert prospects into customers through targeted communication.",
        is_active: true
      });
    } finally {
      setLoadingAgent(false);
    }
  }

  const handleAskProspero = (question: string) => {
    toast({
      title: "Prospero is analyzing your contacts",
      description: `Question: "${question}" - This feature is coming soon!`,
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  // --- Data Fetching Functions ---
  async function fetchContacts() {
    setLoading(true);
    setError(null);
    try {
      // Mock contacts data
      const mockContacts: Contact[] = [
        {
          id: "1",
          first_name: "John",
          last_name: "Smith",
          email: "john.smith@example.com",
          phone_number: "+1-555-0123",
          company: "TechCorp Inc",
          job_title: "Senior Developer",
          lead_source: "Website Form",
          lead_status: "Qualified",
          last_contact_date: "2024-01-15",
          notes: "Interested in enterprise solutions. Follow up scheduled for next week.",
          tags: ["enterprise", "tech", "qualified"],
          priority: "high",
          score: 85,
          last_activity_summary: "Last contacted via email about product demo",
          next_action_suggestion: "Schedule product demonstration call",
          suggested_persona: "Technical Decision Maker",
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-15T14:30:00Z",
          assigned_to_user: "user1",
          assigned_to_user_name: "Sarah Johnson",
          assigned_to_department: "sales",
          assigned_to_department_name: "Sales",
          assigned_to_team: "enterprise",
          assigned_to_team_name: "Enterprise Sales"
        },
        {
          id: "2",
          first_name: "Jane",
          last_name: "Doe",
          email: "jane.doe@startup.com",
          phone_number: "+1-555-0456",
          company: "StartupXYZ",
          job_title: "CEO",
          lead_source: "Referral",
          lead_status: "Prospect",
          last_contact_date: "2024-01-14",
          notes: "Referred by existing customer. Very interested in scaling solutions.",
          tags: ["startup", "ceo", "referral"],
          priority: "medium",
          score: 72,
          last_activity_summary: "Initial discovery call completed",
          next_action_suggestion: "Send case study and pricing proposal",
          suggested_persona: "Business Decision Maker",
          created_at: "2024-01-12T09:00:00Z",
          updated_at: "2024-01-14T16:45:00Z",
          assigned_to_user: "user2",
          assigned_to_user_name: "Mike Chen",
          assigned_to_department: "sales",
          assigned_to_department_name: "Sales",
          assigned_to_team: "smb",
          assigned_to_team_name: "SMB Sales"
        },
        {
          id: "3",
          first_name: "Robert",
          last_name: "Johnson",
          email: "robert.johnson@enterprise.com",
          phone_number: "+1-555-0789",
          company: "Enterprise Solutions",
          job_title: "CTO",
          lead_source: "LinkedIn",
          lead_status: "Lead",
          last_contact_date: "2024-01-13",
          notes: "Connected on LinkedIn. Interested in AI integration capabilities.",
          tags: ["enterprise", "cto", "ai"],
          priority: "high",
          score: 90,
          last_activity_summary: "LinkedIn message exchange about AI features",
          next_action_suggestion: "Schedule technical deep-dive meeting",
          suggested_persona: "Technical Decision Maker",
          created_at: "2024-01-11T11:30:00Z",
          updated_at: "2024-01-13T10:15:00Z",
          assigned_to_user: "user1",
          assigned_to_user_name: "Sarah Johnson",
          assigned_to_department: "sales",
          assigned_to_department_name: "Sales",
          assigned_to_team: "enterprise",
          assigned_to_team_name: "Enterprise Sales"
        },
        {
          id: "4",
          first_name: "Emily",
          last_name: "Brown",
          email: "emily.brown@consulting.com",
          phone_number: "+1-555-0321",
          company: "Digital Consulting Group",
          job_title: "Managing Director",
          lead_source: "Conference",
          lead_status: "Qualified",
          last_contact_date: "2024-01-12",
          notes: "Met at Tech Conference 2024. Discussed partnership opportunities.",
          tags: ["consulting", "partnership", "conference"],
          priority: "medium",
          score: 78,
          last_activity_summary: "Conference follow-up email sent",
          next_action_suggestion: "Schedule partnership discussion call",
          suggested_persona: "Business Decision Maker",
          created_at: "2024-01-10T15:20:00Z",
          updated_at: "2024-01-12T13:45:00Z",
          assigned_to_user: "user3",
          assigned_to_user_name: "Alex Rodriguez",
          assigned_to_department: "partnerships",
          assigned_to_department_name: "Partnerships",
          assigned_to_team: "strategic",
          assigned_to_team_name: "Strategic Partnerships"
        },
        {
          id: "5",
          first_name: "David",
          last_name: "Wilson",
          email: "david.wilson@agency.com",
          phone_number: "+1-555-0654",
          company: "Creative Agency Pro",
          job_title: "Creative Director",
          lead_source: "Website Form",
          lead_status: "Prospect",
          last_contact_date: "2024-01-11",
          notes: "Interested in design automation tools. Requested demo.",
          tags: ["agency", "design", "automation"],
          priority: "low",
          score: 65,
          last_activity_summary: "Demo request submitted via website",
          next_action_suggestion: "Prepare and send demo video",
          suggested_persona: "Creative Decision Maker",
          created_at: "2024-01-09T12:00:00Z",
          updated_at: "2024-01-11T09:30:00Z",
          assigned_to_user: "user2",
          assigned_to_user_name: "Mike Chen",
          assigned_to_department: "sales",
          assigned_to_department_name: "Sales",
          assigned_to_team: "smb",
          assigned_to_team_name: "SMB Sales"
        }
      ];
      
      setContacts(mockContacts);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load contacts.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // --- Data Gaps Fetching ---
  async function fetchDataGaps(contactId: string) {
    setLoadingGaps(true);
    try {
      // Mock data gaps based on contact ID
      const mockGaps = [
        {
          field: "phone_number",
          message: "Phone number is missing - Add phone number for better communication"
        },
        {
          field: "company",
          message: "Company information is incomplete - Add company details for better lead qualification"
        }
      ];
      
      setDataGaps(mockGaps);
      
      // Show toast message based on gaps found
      if (mockGaps.length === 0) {
        toast({
          title: "Data Quality Check",
          description: "All crucial data points are present!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Data Gaps Identified",
          description: `${mockGaps.length} crucial data point(s) missing.`,
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch data gaps:", err);
      setDataGaps([]);
      toast({
        title: "Error",
        description: "Failed to analyze data quality.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingGaps(false);
    }
  }

  // --- Duplicate Detection Fetching ---
  async function fetchDuplicates() {
    setLoadingDuplicates(true);
    try {
      // Mock duplicate groups
      const mockDuplicateGroups = [
        {
          id: "group1",
          contacts: [
            {
              id: "1",
              first_name: "John",
              last_name: "Smith",
              email: "john.smith@example.com",
              company: "TechCorp Inc",
              score: 85,
              created_at: "2024-01-10T10:00:00Z"
            },
            {
              id: "6",
              first_name: "John",
              last_name: "Smith",
              email: "john.smith@techcorp.com",
              company: "TechCorp Inc",
              score: 72,
              created_at: "2024-01-08T14:20:00Z"
            }
          ],
          similarity_score: 0.92,
          suggested_master: "1"
        },
        {
          id: "group2",
          contacts: [
            {
              id: "2",
              first_name: "Jane",
              last_name: "Doe",
              email: "jane.doe@startup.com",
              company: "StartupXYZ",
              score: 72,
              created_at: "2024-01-12T09:00:00Z"
            },
            {
              id: "7",
              first_name: "Jane",
              last_name: "Doe",
              email: "jane.doe@startupxyz.com",
              company: "StartupXYZ",
              score: 68,
              created_at: "2024-01-07T11:15:00Z"
            }
          ],
          similarity_score: 0.88,
          suggested_master: "2"
        }
      ];
      
      setDuplicateGroups(mockDuplicateGroups);
      
      // Show toast message based on duplicates found
      if (mockDuplicateGroups.length === 0) {
        toast({
          title: "Duplicate Check",
          description: "No potential duplicate contacts found.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Duplicates Found",
          description: `Found ${mockDuplicateGroups.length} potential duplicate group(s).`,
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch duplicates:", err);
      setDuplicateGroups([]);
      toast({
        title: "Error",
        description: "Failed to check for duplicate contacts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingDuplicates(false);
    }
  }

  // --- Handlers for Create Form ---
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewContactForm({ ...newContactForm, [name]: value });
  };

  const handleCreateContactSubmit = async () => {
    if (!newContactForm.first_name || !newContactForm.last_name || !newContactForm.email) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in first name, last name, and email.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Mock contact creation
      const newContact: Contact = {
        id: Date.now().toString(),
        first_name: newContactForm.first_name,
        last_name: newContactForm.last_name,
        email: newContactForm.email,
        phone_number: newContactForm.phone_number || undefined,
        company: newContactForm.company || undefined,
        job_title: newContactForm.job_title || undefined,
        lead_source: newContactForm.lead_source || undefined,
        lead_status: "Lead",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: [],
        priority: "medium",
        score: 50,
        assigned_to_user: "user1",
        assigned_to_user_name: "Sarah Johnson",
        assigned_to_department: "sales",
        assigned_to_department_name: "Sales",
        assigned_to_team: "smb",
        assigned_to_team_name: "SMB Sales"
      };

      setContacts(prev => [newContact, ...prev]);
      
      // Reset form
      setNewContactForm(initialCreateContactFormState);
      onEditModalClose();
      
      toast({
        title: "Contact Created",
        description: `${newContact.first_name} ${newContact.last_name} has been added successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      console.error("Failed to create contact:", err);
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // --- Edit Contact Modal Handlers ---
  const handleEditModalOpen = (contact: Contact) => {
    setEditingContact(contact);
    setEditForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone_number: contact.phone_number || "",
      company: contact.company || "",
      job_title: contact.job_title || "",
      lead_source: contact.lead_source || "",
      lead_status: contact.lead_status || "",
      last_contact_date: contact.last_contact_date || "",
      notes: contact.notes || "",
      tags: contact.tags || [],
    });
    onEditModalOpen();
  };

  const handleEditModalClose = () => {
    setEditingContact(null);
    setEditForm({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      company: "",
      job_title: "",
      lead_source: "",
      lead_status: "",
      last_contact_date: "",
      notes: "",
      tags: [],
    });
    onEditModalClose();
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleTagChange = (tags: string[]) => {
    setEditForm({ ...editForm, tags });
  };

  const handleSaveEditedContact = async () => {
    if (!editingContact) return;

    try {
      // Mock contact update
      const updatedContact: Contact = {
        ...editingContact,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone_number: editForm.phone_number,
        company: editForm.company,
        job_title: editForm.job_title,
        lead_source: editForm.lead_source,
        lead_status: editForm.lead_status,
        last_contact_date: editForm.last_contact_date,
        notes: editForm.notes,
        tags: editForm.tags,
        updated_at: new Date().toISOString(),
      };

      setContacts(prev => prev.map(contact => 
        contact.id === editingContact.id ? updatedContact : contact
      ));
      
      handleEditModalClose();
      
      toast({
        title: "Contact Updated",
        description: `${updatedContact.first_name} ${updatedContact.last_name} has been updated successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      console.error("Failed to update contact:", err);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // --- Delete Contact Handler ---
  const handleDeleteContact = async (id: string) => {
    try {
      // Mock contact deletion
      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: "Contact Deleted",
        description: "Contact has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      console.error("Failed to delete contact:", err);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // --- AI Insights Generation ---
  const handleGenerateAIInsights = async (contactId: string) => {
    try {
      // Mock AI insights generation
      const mockInsights = {
        last_activity_summary: "Last contacted via email about product demo. Showed interest in enterprise features.",
        next_action_suggestion: "Schedule a technical deep-dive meeting to discuss implementation details.",
        suggested_persona: "Technical Decision Maker - High influence on purchasing decisions."
      };

      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { 
              ...contact, 
              last_activity_summary: mockInsights.last_activity_summary,
              next_action_suggestion: mockInsights.next_action_suggestion,
              suggested_persona: mockInsights.suggested_persona,
              updated_at: new Date().toISOString()
            }
          : contact
      ));
      
      toast({
        title: "AI Insights Generated",
        description: "AI-powered insights have been generated for this contact.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: unknown) {
      console.error("Failed to generate AI insights:", err);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // --- Merge Functions ---
  const handleContactSelectionChange = (contactId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedForMerge(prev => [...prev, contactId]);
    } else {
      setSelectedForMerge(prev => prev.filter(id => id !== contactId));
      // If the deselected contact was the master, clear master selection
      if (masterContactId === contactId) {
        setMasterContactId(null);
      }
    }
  };

  const handleSetMasterContact = (contactId: string) => {
    setMasterContactId(contactId);
    // Ensure the master contact is also selected for merge
    if (!selectedForMerge.includes(contactId)) {
      setSelectedForMerge(prev => [...prev, contactId]);
    }
  };

  const handleClearSelection = () => {
    setSelectedForMerge([]);
    setMasterContactId(null);
    setMergePreview(null);
  };

  const handlePreviewMerge = () => {
    if (selectedForMerge.length < 2) {
      toast({
        title: "Selection Required",
        description: "Please select at least 2 contacts to merge.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!masterContactId) {
      toast({
        title: "Master Contact Required",
        description: "Please select a master contact for the merge.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Mock merge preview
    const masterContact = contacts.find(c => c.id === masterContactId);
    const duplicateContacts = contacts.filter(c => selectedForMerge.includes(c.id) && c.id !== masterContactId);

    if (!masterContact) return;

    const mockMergePreview = {
      master_contact: masterContact,
      duplicate_contacts: duplicateContacts,
      merged_data: {
        first_name: masterContact.first_name,
        last_name: masterContact.last_name,
        email: masterContact.email,
        phone_number: masterContact.phone_number || duplicateContacts.find(c => c.phone_number)?.phone_number,
        company: masterContact.company || duplicateContacts.find(c => c.company)?.company,
        job_title: masterContact.job_title || duplicateContacts.find(c => c.job_title)?.job_title,
        lead_source: masterContact.lead_source || duplicateContacts.find(c => c.lead_source)?.lead_source,
        lead_status: masterContact.lead_status || duplicateContacts.find(c => c.lead_status)?.lead_status,
        notes: [masterContact.notes, ...duplicateContacts.map(c => c.notes)].filter(Boolean).join('\n\n'),
        tags: [...new Set([...(masterContact.tags || []), ...duplicateContacts.flatMap(c => c.tags || [])])],
        priority: masterContact.priority || duplicateContacts.find(c => c.priority)?.priority,
        score: Math.max(masterContact.score || 0, ...duplicateContacts.map(c => c.score || 0))
      }
    };

    setMergePreview(mockMergePreview);
    onMergeConfirmModalOpen();
  };

  const handleMergeConfirmed = async () => {
    if (!masterContactId || !mergePreview) return;

    try {
      // Mock merge logic
      const duplicateIds = selectedForMerge.filter(id => id !== masterContactId);
      
      // Update master contact with merged data
      const updatedMasterContact = {
        ...mergePreview.master_contact,
        ...mergePreview.merged_data,
        updated_at: new Date().toISOString()
      };

      // Remove duplicates and update master
      setContacts(prev => prev.map(contact => 
        contact.id === masterContactId ? updatedMasterContact : contact
      ).filter(contact => !duplicateIds.includes(contact.id)));

      // Reset state
      setSelectedForMerge([]);
      setMasterContactId(null);
      setMergePreview(null);
      onMergeConfirmModalClose();
      
      toast({
        title: "Merge Successful",
        description: "Contacts have been successfully merged.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      console.error("Failed to merge contacts:", error);
      toast({
        title: "Error",
        description: "Failed to merge contacts. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExportCsv = async () => {
    try {
      // Mock CSV export
      const csvData = contacts.map(contact => ({
        'First Name': contact.first_name,
        'Last Name': contact.last_name,
        'Email': contact.email,
        'Phone': contact.phone_number || '',
        'Company': contact.company || '',
        'Job Title': contact.job_title || '',
        'Lead Source': contact.lead_source || '',
        'Lead Status': contact.lead_status || '',
        'Priority': contact.priority || '',
        'Score': contact.score || 0,
        'Tags': (contact.tags || []).join(', '),
        'Notes': contact.notes || '',
        'Created': contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '',
        'Last Updated': contact.updated_at ? new Date(contact.updated_at).toLocaleDateString() : ''
      }));

      // Create CSV content
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Contacts have been exported to CSV successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: unknown) {
      console.error("Failed to export contacts:", error);
      toast({
        title: "Error",
        description: "Failed to export contacts. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // --- Contact Stats Calculation ---
  const totalContacts = contacts.length;
  const newLeads = contacts.filter(c => c.lead_status === 'New Lead').length;
  const qualifiedLeads = contacts.filter(c => c.lead_status === 'Qualified').length;
  const customers = contacts.filter(c => c.lead_status === 'Customer').length;

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" color="brand.primary" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box py={4} px={{ base: 0, md: 4 }}>
        <Heading size="lg" color="brand.primary" mb={6}>
          <HStack>
            <FiUsers />
            <Text>Contact Management</Text>
          </HStack>
        </Heading>

        {/* Prospero AI Agent Section */}
        <AIAgentSection
          agent={prosperoAgent}
          loading={loadingAgent}
          error={agentError}
          onAskQuestion={handleAskProspero}
        />

        {error && (
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <VStack spacing={6} align="stretch">
          {/* Contact Stats Section */}
          <Box>
            <Heading size="md" color="brand.primary" mb={4}>Contact Stats</Heading>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
                <StatLabel>Total Contacts</StatLabel>
                <StatNumber fontSize="2xl">{totalContacts}</StatNumber>
                <StatHelpText>All contacts in your system</StatHelpText>
              </Stat>
              <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
                <StatLabel>New Leads</StatLabel>
                <StatNumber fontSize="2xl">{newLeads}</StatNumber>
                <StatHelpText>Recently added prospects</StatHelpText>
              </Stat>
              <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
                <StatLabel>Qualified Leads</StatLabel>
                <StatNumber fontSize="2xl">{qualifiedLeads}</StatNumber>
                <StatHelpText>Prospects ready for next steps</StatHelpText>
              </Stat>
              <Stat p={5} shadow="md" border="1px" borderColor="gray.200" borderRadius="md">
                <StatLabel>Customers</StatLabel>
                <StatNumber fontSize="2xl">{customers}</StatNumber>
                <StatHelpText>Converted into customers</StatHelpText>
              </Stat>
            </SimpleGrid>
          </Box>

          {/* Create New Contact Section */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="brand.primary">Create New Contact</Heading>
              <Button
                leftIcon={isCreateFormVisible ? <FiXCircle /> : <FiPlus />}
                bg={isCreateFormVisible ? "red.500" : "brand.primary"}
                color={isCreateFormVisible ? "white" : "brand.accent"}
                fontWeight="bold"
                _hover={{ bg: isCreateFormVisible ? "red.600" : "brand.600" }}
                _active={{ bg: isCreateFormVisible ? "red.700" : "brand.700" }}
                onClick={() => setIsCreateFormVisible(!isCreateFormVisible)}
              >
                {isCreateFormVisible ? "Cancel" : "Add New Contact"}
              </Button>
            </HStack>

            {isCreateFormVisible && (
              <Card mt={4}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          name="first_name"
                          value={newContactForm.first_name}
                          onChange={handleCreateFormChange}
                          placeholder="John"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          name="last_name"
                          value={newContactForm.last_name}
                          onChange={handleCreateFormChange}
                          placeholder="Doe"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={newContactForm.email}
                        onChange={handleCreateFormChange}
                        placeholder="john.doe@example.com"
                      />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                          name="phone_number"
                          value={newContactForm.phone_number || ""}
                          onChange={handleCreateFormChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Company</FormLabel>
                        <Input
                          name="company"
                          value={newContactForm.company || ""}
                          onChange={handleCreateFormChange}
                          placeholder="Acme Corp"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel>Job Title</FormLabel>
                      <Input
                        name="job_title"
                        value={newContactForm.job_title || ""}
                        onChange={handleCreateFormChange}
                        placeholder="Marketing Manager"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Lead Source</FormLabel>
                      <Select
                        name="lead_source"
                        value={newContactForm.lead_source || ""}
                        onChange={handleCreateFormChange}
                        placeholder="Select Lead Source"
                      >
                        {LEAD_SOURCE_OPTIONS.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <Button
                      leftIcon={<FiSave />}
                      bg="brand.primary"
                      color="brand.accent"
                      fontWeight="bold"
                      _hover={{ bg: "brand.600" }}
                      _active={{ bg: "brand.700" }}
                      onClick={handleCreateContactSubmit}
                      isLoading={saving}
                      loadingText="Creating..."
                      isDisabled={!newContactForm.first_name || !newContactForm.last_name || !newContactForm.email}
                    >
                      Create Contact
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </Box>

          {/* Contact List Section */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <HStack> {/* Group your main actions here */}
                <Heading size="md" color="brand.primary">Contact List</Heading>
                {/* Optional: Add a search/filter bar here in the future */}
              </HStack>
              <HStack> {/* Group action buttons here */}
                {/* Export to CSV Button */}
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="teal"
                  onClick={handleExportCsv}
                  isLoading={exporting}
                  loadingText="Exporting..."
                  isDisabled={contacts.length === 0} // Disable if no contacts to export
                >
                  Export to CSV
                </Button>
              </HStack>
            </HStack>

            {contacts.length === 0 && !loading && (
              <Text color="gray.500">No contacts found. Add your first contact to get started.</Text>
            )}

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {contacts.map((contact) => (
                <Card key={contact.id} boxShadow="md" _hover={{ boxShadow: "lg" }} transition="all 0.2s ease-in-out">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="md">{contact.first_name} {contact.last_name}</Heading>
                      <Text fontSize="sm" color="gray.600">{contact.job_title} at {contact.company}</Text>
                      <Text fontSize="sm" color="gray.600">{contact.email}</Text>
                      {contact.phone_number && <Text fontSize="sm" color="gray.600">Phone: {contact.phone_number}</Text>}

                      <HStack wrap="wrap">
                        {contact.lead_status && (
                          <Badge
                            colorScheme={
                              contact.lead_status === 'New Lead' ? 'blue' :
                                contact.lead_status === 'Qualified' ? 'green' :
                                  contact.lead_status === 'Customer' ? 'purple' : 'gray'
                            }
                          >
                            {contact.lead_status}
                          </Badge>
                        )}
                        {contact.priority && (
                          <Badge
                            colorScheme={
                              contact.priority === 'High' ? 'red' :
                                contact.priority === 'Medium' ? 'orange' : 'gray'
                            }
                          >
                            Priority: {contact.priority}
                          </Badge>
                        )}
                        {contact.lead_source && (
                          <Badge colorScheme="teal">Source: {contact.lead_source}</Badge>
                        )}
                      </HStack>

                      {/* Lead Assignment Display */}
                      <HStack wrap="wrap" mt={1}>
                        {contact.assigned_to_user_name ? (
                          <Badge colorScheme="purple" variant="solid">Assigned: {contact.assigned_to_user_name}</Badge>
                        ) : contact.assigned_to_team_name ? (
                          <Badge colorScheme="cyan" variant="solid">Team: {contact.assigned_to_team_name}</Badge>
                        ) : contact.assigned_to_department_name ? (
                          <Badge colorScheme="blue" variant="solid">Dept: {contact.assigned_to_department_name}</Badge>
                        ) : (
                          <Badge colorScheme="gray" variant="solid">Unassigned</Badge>
                        )}
                      </HStack>

                      {/* AI Insights Display */}
                      {(contact.last_activity_summary || contact.next_action_suggestion || contact.suggested_persona) && (
                        <Box mt={3} p={3} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
                          <Text fontSize="xs" fontWeight="bold" color="purple.700" mb={2}>
                            🤖 AI Insights
                          </Text>
                          {contact.suggested_persona && (
                            <Text fontSize="xs" color="purple.600" mb={1}>
                              <strong>Persona:</strong> {contact.suggested_persona}
                            </Text>
                          )}
                          {contact.last_activity_summary && (
                            <Text fontSize="xs" color="purple.600" mb={1}>
                              <strong>Summary:</strong> {contact.last_activity_summary}
                            </Text>
                          )}
                          {contact.next_action_suggestion && (
                            <Text fontSize="xs" color="purple.600">
                              <strong>Suggestion:</strong> {contact.next_action_suggestion}
                            </Text>
                          )}
                        </Box>
                      )}

                      <ButtonGroup size="sm" isAttached mt={3}>
                        <Button 
                          leftIcon={<FiEdit />} 
                          onClick={() => handleEditModalOpen(contact)} 
                          bg="brand.primary"
                          color="brand.accent"
                          fontWeight="bold"
                          _hover={{ bg: "brand.600" }}
                          _active={{ bg: "brand.700" }}
                        >
                          Edit Details
                        </Button>
                        <IconButton
                          aria-label="Generate AI insights"
                          icon={<FiZap />}
                          onClick={() => handleGenerateAIInsights(contact.id)}
                          colorScheme="purple"
                          isLoading={generatingAIInsights === contact.id}
                        />
                        <IconButton
                          aria-label="Delete contact"
                          icon={<FiTrash2 />}
                          onClick={() => handleDeleteContact(contact.id)}
                          colorScheme="red"
                        />
                      </ButtonGroup>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Potential Duplicates Section */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="red.500">Potential Duplicate Contacts</Heading>
              <HStack spacing={2}>
                <Button
                  leftIcon={<FiInfo />}
                  variant="brand"
                  size="sm"
                  onClick={fetchDuplicates}
                  isLoading={loadingDuplicates}
                >
                  Refresh Duplicates
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handlePreviewMerge}
                  isDisabled={selectedForMerge.length < 2 || !masterContactId || !selectedForMerge.includes(masterContactId)}
                >
                  Preview & Merge Selected
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleClearSelection}
                  isDisabled={selectedForMerge.length === 0}
                >
                  Clear Selection
                </Button>
              </HStack>
            </HStack>

            {loadingDuplicates ? (
              <HStack justify="center" py={8}>
                <Spinner size="md" color="red.500" />
                <Text fontSize="sm" color="gray.600">Analyzing contacts for duplicates...</Text>
              </HStack>
            ) : duplicateGroups.length === 0 ? (
              <Card>
                <CardBody>
                  <Text color="gray.500">No potential duplicate contacts found.</Text>
                </CardBody>
              </Card>
            ) : (
              <VStack spacing={6} align="stretch">
                {duplicateGroups.map((group, index) => (
                  <Card key={index} borderLeft="4px solid" borderColor="red.400" boxShadow="md">
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Heading size="sm" color="red.600">
                          Duplicate Reason: {group.reason} (Value: {group.value})
                        </Heading>
                        <Text fontSize="sm" color="gray.600">
                          Found {group.contacts.length} contacts sharing this information:
                        </Text>
                        <VStack align="stretch" pl={4} borderLeft="2px solid" borderColor="gray.200">
                          {group.contacts.map((contact: unknown) => (
                            <Box key={contact.id} p={3} bg="gray.50" borderRadius="md">
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between" align="start">
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="semibold">{contact.first_name} {contact.last_name}</Text>
                                    <Text fontSize="sm">Email: {contact.email}</Text>
                                    {contact.phone_number && <Text fontSize="sm">Phone: {contact.phone_number}</Text>}
                                    {contact.company && <Text fontSize="sm">Company: {contact.company}</Text>}
                                    {contact.job_title && <Text fontSize="sm">Title: {contact.job_title}</Text>}
                                  </VStack>
                                  <VStack align="end" spacing={2}>
                                    <Button
                                      size="sm"
                                      bg="brand.primary"
                                      color="brand.accent"
                                      fontWeight="bold"
                                      _hover={{ bg: "brand.600" }}
                                      _active={{ bg: "brand.700" }}
                                      onClick={() => handleEditModalOpen(contact)}
                                    >
                                      View Details
                                    </Button>
                                  </VStack>
                                </HStack>
                                
                                {/* Merge Selection Controls */}
                                <HStack justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="gray.200">
                                  <HStack spacing={4}>
                                    <Checkbox
                                      isChecked={selectedForMerge.includes(contact.id)}
                                      onChange={(e) => handleContactSelectionChange(contact.id, e.target.checked)}
                                      isDisabled={masterContactId === contact.id}
                                      colorScheme="red"
                                    >
                                      Select for Merge
                                    </Checkbox>
                                    <Button
                                      size="xs"
                                      colorScheme={masterContactId === contact.id ? "green" : "gray"}
                                      variant={masterContactId === contact.id ? "solid" : "outline"}
                                      onClick={() => handleSetMasterContact(contact.id)}
                                      isDisabled={!selectedForMerge.includes(contact.id)}
                                    >
                                      {masterContactId === contact.id ? "✓ Master" : "Make Master"}
                                    </Button>
                                  </HStack>
                                  {masterContactId === contact.id && (
                                    <Badge colorScheme="green" fontSize="xs">
                                      Master Contact
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Edit Contact Modal */}
      <Modal isOpen={isEditModalOpen} onClose={handleEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Contact: {editingContact?.first_name} {editingContact?.last_name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingContact && (
              <VStack spacing={4} align="stretch">
                {/* Basic Information */}
                <Box>
                  <Heading size="sm" mb={2}>Basic Information</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        name="first_name"
                        value={editForm.first_name || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        name="last_name"
                        value={editForm.last_name || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={editForm.email || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        name="phone_number"
                        value={editForm.phone_number || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Company</FormLabel>
                      <Input
                        name="company"
                        value={editForm.company || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Job Title</FormLabel>
                      <Input
                        name="job_title"
                        value={editForm.job_title || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* Lead Management */}
                <Box>
                  <Heading size="sm" mt={4} mb={2}>Lead Management</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Lead Source</FormLabel>
                      <Select
                        name="lead_source"
                        value={editForm.lead_source || ""}
                        onChange={handleEditFormChange}
                        placeholder="Select Lead Source"
                      >
                        {LEAD_SOURCE_OPTIONS.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Lead Status</FormLabel>
                      <Select
                        name="lead_status"
                        value={editForm.lead_status || "New Lead"}
                        onChange={handleEditFormChange}
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Customer">Customer</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        name="priority"
                        value={editForm.priority || "Medium"}
                        onChange={handleEditFormChange}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Lead Score</FormLabel>
                      <Input
                        name="score"
                        type="number"
                        value={editForm.score || 0}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Last Contact Date</FormLabel>
                      <Input
                        name="last_contact_date"
                        type="date"
                        value={editForm.last_contact_date || ""}
                        onChange={handleEditFormChange}
                      />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl mt={4}>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      name="notes"
                      value={editForm.notes || ""}
                      onChange={handleEditFormChange}
                      placeholder="Add internal notes about this contact..."
                      rows={3}
                    />
                  </FormControl>
                  <TagInput
                    label="Tags"
                    value={Array.isArray(editForm.tags) ? editForm.tags : []}
                    onChange={handleTagChange}
                    placeholder="Add tags (e.g., VIP, EMEA, Marketing)"
                  />
                </Box>

                {/* Data Gaps Section */}
                <Box>
                  <HStack mt={4} mb={2}>
                    <Heading size="sm">Data Quality Check</Heading>
                    <FiInfo size="18px" />
                  </HStack>
                  
                  {loadingGaps ? (
                    <HStack justify="center" py={4}>
                      <Spinner size="sm" color="brand.primary" />
                      <Text fontSize="sm" color="gray.600">Analyzing data quality...</Text>
                    </HStack>
                  ) : dataGaps.length > 0 ? (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold">Crucial data missing!</Text>
                        <VStack align="start" spacing={1}>
                          {dataGaps.map((gap, index) => (
                            <Text key={index} fontSize="sm">
                              <strong>• {gap.field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {gap.message}
                            </Text>
                          ))}
                        </VStack>
                      </VStack>
                    </Alert>
                  ) : (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Text fontWeight="bold">All crucial data points are present!</Text>
                    </Alert>
                  )}
                </Box>

                {/* Lead Assignment - Read-Only */}
                <Box mt={6}>
                  <Heading size="sm" mb={2}>Lead Assignment</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Assigned User</FormLabel>
                      <Input
                        value={editForm.assigned_to_user_name || "Not Assigned"}
                        isReadOnly
                        disabled
                        placeholder="Automatically assigned"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Assigned Department</FormLabel>
                      <Input
                        value={editForm.assigned_to_department_name || "Not Assigned"}
                        isReadOnly
                        disabled
                        placeholder="Automatically assigned"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Assigned Team</FormLabel>
                      <Input
                        value={editForm.assigned_to_team_name || "Not Assigned"}
                        isReadOnly
                        disabled
                        placeholder="Automatically assigned"
                      />
                    </FormControl>
                  </SimpleGrid>
                </Box>

                {/* AI Insights - Read-Only */}
                <Box>
                  <HStack mt={4} mb={2}>
                    <Heading size="sm">AI Insights (by Prospero)</Heading>
                    <FiInfo size="18px" />
                  </HStack>

                  {/* Chat Transcript Input */}
                  <FormControl mt={2}>
                    <FormLabel>Simulate Chat Transcript for Analysis</FormLabel>
                    <Textarea
                      value={chatTranscriptInput}
                      onChange={(e) => setChatTranscriptInput(e.target.value)}
                      placeholder="Paste a chat transcript here for Prospero to analyze (e.g., 'Customer asked about pricing and demo availability')."
                      rows={4}
                      isDisabled={merging} // Disable while merge is in progress
                    />
                  </FormControl>

                  <Button
                    leftIcon={<FiZap />}
                    colorScheme="purple"
                    onClick={() => editingContact && handleGenerateAIInsights(editingContact.id)}
                    isLoading={generatingAIInsights === editingContact?.id}
                    loadingText="Generating..."
                    mt={4}
                    isDisabled={!editingContact}
                  >
                    Generate AI Insights (by Prospero)
                  </Button>

                  <FormControl mt={4}>
                    <FormLabel>AI Suggested Persona</FormLabel>
                    <Input
                      name="suggested_persona"
                      value={editForm.suggested_persona || "Not yet analyzed"}
                      isReadOnly
                      disabled
                    />
                  </FormControl>

                  <FormControl mt={2}>
                    <FormLabel>Last Activity Summary</FormLabel>
                    <Textarea
                      name="last_activity_summary"
                      value={editForm.last_activity_summary || "No AI summary available yet."}
                      isReadOnly
                      disabled
                      rows={5} // Give more space for potential chat insights
                    />
                  </FormControl>
                  <FormControl mt={2}>
                    <FormLabel>Next Action Suggestion</FormLabel>
                    <Textarea
                      name="next_action_suggestion"
                      value={editForm.next_action_suggestion || "No AI suggestion available yet."}
                      isReadOnly
                      disabled
                      rows={3}
                    />
                  </FormControl>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleEditModalClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              ml={3}
              onClick={handleSaveEditedContact}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Merge Confirmation Modal */}
      <Modal isOpen={isMergeConfirmModalOpen} onClose={onMergeConfirmModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Contact Merge</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {mergePreview && (
              <VStack spacing={4} align="stretch">
                {/* Master Contact Info */}
                <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                  <Heading size="sm" color="green.700" mb={2}>
                    🎯 Master Contact (Will Be Preserved)
                  </Heading>
                  <Text fontWeight="semibold">
                    {mergePreview.master_contact.first_name} {mergePreview.master_contact.last_name}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Email: {mergePreview.master_contact.email}
                  </Text>
                  {mergePreview.master_contact.company && (
                    <Text fontSize="sm" color="gray.600">
                      Company: {mergePreview.master_contact.company}
                    </Text>
                  )}
                </Box>

                {/* Contacts to be Deleted */}
                <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <Heading size="sm" color="red.700" mb={2}>
                    🗑️ Contacts to be Deleted
                  </Heading>
                  <VStack align="start" spacing={1}>
                    {contacts
                      .filter(c => selectedForMerge.includes(c.id) && c.id !== masterContactId)
                      .map(contact => (
                        <Text key={contact.id} fontSize="sm">
                          • {contact.first_name} {contact.last_name} ({contact.email})
                        </Text>
                      ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Merge Preview */}
                <Box>
                  <Heading size="sm" mb={3}>Merge Preview</Heading>
                  
                  {/* Combined Notes */}
                  {mergePreview.merged_data.notes && (
                    <Box mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" mb={1}>
                        Combined Notes:
                      </Text>
                      <Box p={3} bg="gray.50" borderRadius="md" maxH="100px" overflowY="auto">
                        <Text fontSize="sm" whiteSpace="pre-wrap">
                          {mergePreview.merged_data.notes}
                        </Text>
                      </Box>
                    </Box>
                  )}

                  {/* Combined Tags */}
                  {mergePreview.merged_data.tags && mergePreview.merged_data.tags.length > 0 && (
                    <Box mb={3}>
                      <Text fontSize="sm" fontWeight="semibold" mb={1}>
                        Combined Tags:
                      </Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {mergePreview.merged_data.tags.map((tag, index) => (
                          <Badge key={index} colorScheme="blue" fontSize="xs">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {/* Warning */}
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Important:</Text>
                      <Text fontSize="sm">
                        • The master contact will be updated with combined data
                      </Text>
                      <Text fontSize="sm">
                        • All duplicate contacts will be permanently deleted
                      </Text>
                      <Text fontSize="sm">
                        • This action cannot be undone
                      </Text>
                    </VStack>
                  </Alert>
                </Box>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onMergeConfirmModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={handleMergeConfirmed}
              isLoading={merging}
              loadingText="Merging..."
            >
              Confirm Merge
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}