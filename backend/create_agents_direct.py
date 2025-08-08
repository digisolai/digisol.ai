#!/usr/bin/env python3
"""
Script to create AI agents directly using the deployed API.
"""

import requests
import json
import time

def create_ai_agents():
    """Create all necessary AI agents using the deployed API."""
    
    base_url = 'https://digisol-backend.onrender.com/api'
    
    print("🚀 Creating AI Agents via Deployed API")
    print("=" * 50)
    
    # Step 1: Authenticate
    print("\n1. Authenticating...")
    try:
        auth_response = requests.post(f'{base_url}/accounts/token/', 
                                    json={'email': 'test2@example.com', 'password': 'testpass123'},
                                    timeout=10)
        
        if auth_response.status_code == 200:
            token_data = auth_response.json()
            access_token = token_data.get('access')
            print("   ✅ Authentication successful")
            
            # Set up headers for authenticated requests
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
        else:
            print(f"   ❌ Authentication failed: {auth_response.status_code}")
            return
            
    except Exception as e:
        print(f"   ❌ Authentication error: {e}")
        return
    
    # Step 2: Check if agents already exist
    print("\n2. Checking existing agents...")
    try:
        response = requests.get(f'{base_url}/ai-services/profiles/', 
                              headers=headers, timeout=10)
        
        if response.status_code == 200:
            existing_agents = response.json()
            print(f"   Found {len(existing_agents)} existing agents")
            
            if existing_agents:
                print("   Existing agents:")
                for agent in existing_agents:
                    name = agent.get('name', 'Unknown')
                    specialization = agent.get('specialization', 'Unknown')
                    print(f"     - {name} ({specialization})")
                
                # Check if Automatix already exists
                automatix_exists = any(agent.get('name') == 'Automatix' for agent in existing_agents)
                if automatix_exists:
                    print("\n   ✅ Automatix agent already exists!")
                    return
        else:
            print(f"   Error checking existing agents: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error checking existing agents: {e}")
    
    # Step 3: Create agents one by one with proper error handling
    print("\n3. Creating AI agents...")
    
    # Define agents to create
    agents_to_create = [
        {
            "name": "Automatix",
            "specialization": "automation_design",
            "personality_description": "Efficient, systematic, and workflow-optimized. Automatix specializes in designing and implementing automated marketing workflows that save time and increase conversions.",
            "is_active": True
        },
        {
            "name": "Scriptor",
            "specialization": "content_creation",
            "personality_description": "Creative, engaging, and brand-conscious. Scriptor excels at creating compelling content that resonates with your target audience and drives engagement.",
            "is_active": True
        },
        {
            "name": "Prospero",
            "specialization": "lead_nurturing",
            "personality_description": "Patient, strategic, and relationship-focused. Prospero develops personalized lead nurturing strategies that convert prospects into loyal customers.",
            "is_active": True
        },
        {
            "name": "Pecunia",
            "specialization": "budget_analysis",
            "personality_description": "Meticulous, cost-conscious, and ROI-focused. Pecunia provides intelligent budget analysis and optimization recommendations for maximum marketing efficiency.",
            "is_active": True
        },
        {
            "name": "Metrika",
            "specialization": "data_analysis",
            "personality_description": "Analytical, precise, and insight-driven. Metrika excels at complex data analysis, pattern recognition, and strategic insights for data-driven decisions.",
            "is_active": True
        },
        {
            "name": "Quantia",
            "specialization": "reporting_insights",
            "personality_description": "Clear, visual, and actionable. Quantia transforms complex data into clear, actionable insights and beautiful reports that drive decision-making.",
            "is_active": True
        },
        {
            "name": "Structura",
            "specialization": "organizational_planning",
            "personality_description": "Orderly, collaborative, and efficiency-driven. Structura helps optimize team structures, roles, and workflows for peak performance.",
            "is_active": True
        },
        {
            "name": "Icona",
            "specialization": "brand_identity",
            "personality_description": "Creative, visually-driven, and brand-conscious. Icona helps develop and maintain cohesive brand identity across all touchpoints.",
            "is_active": True
        },
        {
            "name": "Connectus",
            "specialization": "integrations_management",
            "personality_description": "Technical, bridge-building, and ecosystem-focused. Connectus ensures seamless data flow and interoperability between all your marketing and business tools.",
            "is_active": True
        },
        {
            "name": "Mentor",
            "specialization": "learning_guidance",
            "personality_description": "Patient, encouraging, and adaptive. Mentor personalizes your learning journey and helps you master new skills at your own pace.",
            "is_active": True
        },
        {
            "name": "Orchestra",
            "specialization": "general_orchestration",
            "personality_description": "Strategic, collaborative, and coordination-focused. Orchestra orchestrates all your AI agents and marketing activities for maximum impact.",
            "is_active": True
        },
        {
            "name": "Curator",
            "specialization": "template_curation",
            "personality_description": "Organized, quality-focused, and user-centric. Curator helps you find, organize, and customize the perfect templates for your campaigns.",
            "is_active": True
        },
        {
            "name": "Planner",
            "specialization": "project_management",
            "personality_description": "Organized, deadline-driven, and team-focused. Planner helps you manage marketing projects efficiently and keep teams aligned.",
            "is_active": True
        },
        {
            "name": "Strategist",
            "specialization": "marketing_strategy",
            "personality_description": "Strategic, market-aware, and growth-focused. Strategist develops comprehensive marketing strategies that drive business growth.",
            "is_active": True
        },
        {
            "name": "Optimizer",
            "specialization": "campaign_optimization",
            "personality_description": "Data-driven, performance-focused, and continuously improving. Optimizer analyzes campaign performance and suggests optimizations for better results.",
            "is_active": True
        }
    ]
    
    created_count = 0
    
    for agent in agents_to_create:
        try:
            print(f"   Creating {agent['name']} ({agent['specialization']})...")
            
            # Add a small delay to avoid overwhelming the API
            time.sleep(0.5)
            
            response = requests.post(f'{base_url}/ai-services/profiles/', 
                                  json=agent,
                                  headers=headers, 
                                  timeout=15)
            
            if response.status_code in [200, 201]:
                print(f"   ✅ {agent['name']} created successfully")
                created_count += 1
            else:
                print(f"   ❌ Failed to create {agent['name']}: {response.status_code}")
                print(f"      Error: {response.text}")
                
                # If it's a tenant error, try with explicit tenant field
                if "tenant" in response.text.lower():
                    print(f"      Trying with explicit tenant field...")
                    # Get user's tenant first
                    user_response = requests.get(f'{base_url}/accounts/user/', 
                                               headers=headers, timeout=10)
                    if user_response.status_code == 200:
                        user_data = user_response.json()
                        tenant_id = user_data.get('tenant_id')
                        if tenant_id:
                            agent['tenant'] = tenant_id
                            retry_response = requests.post(f'{base_url}/ai-services/profiles/', 
                                                         json=agent,
                                                         headers=headers, 
                                                         timeout=15)
                            if retry_response.status_code in [200, 201]:
                                print(f"   ✅ {agent['name']} created successfully (with tenant)")
                                created_count += 1
                            else:
                                print(f"   ❌ Still failed: {retry_response.text}")
                
        except Exception as e:
            print(f"   ❌ Error creating {agent['name']}: {e}")
    
    print(f"\n✅ Successfully created {created_count} out of {len(agents_to_create)} AI agents")
    
    # Step 4: Verify creation
    print("\n4. Verifying AI agents...")
    try:
        response = requests.get(f'{base_url}/ai-services/profiles/', 
                              headers=headers, timeout=10)
        
        if response.status_code == 200:
            agents = response.json()
            print(f"   Total agents in database: {len(agents)}")
            
            if agents:
                print("   Available agents:")
                for agent in agents:
                    name = agent.get('name', 'Unknown')
                    specialization = agent.get('specialization', 'Unknown')
                    print(f"     - {name} ({specialization})")
            else:
                print("   No agents found")
                
        else:
            print(f"   Error verifying: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error verifying agents: {e}")
    
    # Step 5: Test Automatix specifically
    print("\n5. Testing Automatix agent...")
    try:
        response = requests.get(f'{base_url}/ai-services/profiles/?specialization=automation_design', 
                              headers=headers, timeout=10)
        
        if response.status_code == 200:
            agents = response.json()
            automatix = next((agent for agent in agents if agent.get('name') == 'Automatix'), None)
            
            if automatix:
                print("   ✅ Automatix agent found and working!")
                print(f"      ID: {automatix.get('id')}")
                print(f"      Specialization: {automatix.get('specialization')}")
            else:
                print("   ❌ Automatix agent not found")
                
        else:
            print(f"   Error testing Automatix: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error testing Automatix: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 AI Agents Setup Complete!")
    print("The Automatix agent and all other AI agents should now be available.")

if __name__ == "__main__":
    create_ai_agents()
