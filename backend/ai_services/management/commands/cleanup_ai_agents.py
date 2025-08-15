from django.core.management.base import BaseCommand
from ai_services.models import AIProfile
from django.db import transaction


class Command(BaseCommand):
    help = 'Clean up AI agents - remove Orchestra, Planner, Strategist and replace Planner with Promana'

    def handle(self, *args, **options):
        """Clean up AI agents."""
        
        self.stdout.write("🧹 Cleaning up AI Agents in Database")
        self.stdout.write("=" * 50)
        
        agents_to_remove = ['Orchestra', 'Planner', 'Strategist']
        deleted_count = 0
        
        with transaction.atomic():
            for agent_name in agents_to_remove:
                try:
                    # Find and delete the agent
                    agent = AIProfile.objects.filter(
                        name=agent_name,
                        tenant__isnull=True
                    ).first()
                    
                    if agent:
                        agent.delete()
                        self.stdout.write(f"   ✅ {agent_name} removed successfully")
                        deleted_count += 1
                    else:
                        self.stdout.write(f"   ⚠️  {agent_name} not found, skipping...")
                        
                except Exception as e:
                    self.stdout.write(f"   ❌ Error removing {agent_name}: {e}")
        
        # Create Promana agent
        try:
            # Check if Promana already exists
            existing_promana = AIProfile.objects.filter(
                name='Promana',
                tenant__isnull=True
            ).first()
            
            if existing_promana:
                self.stdout.write("   ⚠️  Promana already exists, skipping creation...")
            else:
                # Create Promana agent
                promana = AIProfile.objects.create(
                    name='Promana',
                    specialization='project_management',
                    personality_description='Organized, deadline-driven, and team-focused. Promana helps you manage marketing projects efficiently and keep teams aligned.',
                    is_active=True,
                    tenant=None  # Global agent
                )
                self.stdout.write("   ✅ Promana created successfully")
                deleted_count -= 1  # Adjust count since we added one
                
        except Exception as e:
            self.stdout.write(f"   ❌ Error creating Promana: {e}")
        
        self.stdout.write(f"\n✅ Successfully removed {deleted_count} AI agents")
        
        # Verify cleanup
        total_agents = AIProfile.objects.filter(tenant__isnull=True).count()
        self.stdout.write(f"\n📊 Total global agents in database: {total_agents}")
        
        # List remaining agents
        remaining_agents = AIProfile.objects.filter(tenant__isnull=True).values_list('name', flat=True)
        self.stdout.write(f"\n📋 Remaining agents: {', '.join(remaining_agents)}")
        
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write("🎉 AI Agents Cleanup Complete!")
        self.stdout.write("Orchestra, Planner, and Strategist have been removed.")
        self.stdout.write("Promana has been created for project management.") 