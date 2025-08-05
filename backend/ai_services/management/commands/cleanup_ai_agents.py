from django.core.management.base import BaseCommand
from ai_services.models import AIProfile
from django.db import transaction
from collections import defaultdict


class Command(BaseCommand):
    help = 'Clean up AI agents by removing Strategos, Nexus, Aura and all duplicates'

    def handle(self, *args, **options):
        self.stdout.write('Cleaning up AI agents...')
        
        # Get all agents
        all_agents = AIProfile.objects.all()
        self.stdout.write(f"Found {all_agents.count()} total agents")
        
        # Agents to remove completely
        agents_to_remove = ['Strategos', 'Nexus', 'Aura']
        
        # Remove specified agents
        removed_count = 0
        for agent_name in agents_to_remove:
            agents = AIProfile.objects.filter(name=agent_name)
            count = agents.count()
            if count > 0:
                agents.delete()
                removed_count += count
                self.stdout.write(f"Removed {count} instances of {agent_name}")
        
        self.stdout.write(f"Removed {removed_count} agents total")
        
        # Now handle duplicates - keep only one of each remaining agent
        remaining_agents = AIProfile.objects.all()
        agent_groups = defaultdict(list)
        
        for agent in remaining_agents:
            agent_groups[agent.name].append(agent)
        
        duplicates_removed = 0
        for agent_name, agents in agent_groups.items():
            if len(agents) > 1:
                # Keep the first one, delete the rest
                agents_to_delete = agents[1:]
                for agent in agents_to_delete:
                    agent.delete()
                    duplicates_removed += 1
                self.stdout.write(f"Removed {len(agents_to_delete)} duplicates of {agent_name}")
        
        self.stdout.write(f"Removed {duplicates_removed} duplicate agents")
        
        # Final count
        final_count = AIProfile.objects.count()
        self.stdout.write(f"Final agent count: {final_count}")
        
        # List remaining agents
        self.stdout.write("\n📋 Remaining AI Agents:")
        for i, agent in enumerate(AIProfile.objects.all().order_by('specialization', 'name'), 1):
            self.stdout.write(f"{i:2d}. {agent.name} ({agent.specialization}) - ID: {agent.id}")
        
        self.stdout.write(self.style.SUCCESS(f"\n✅ Cleanup complete! {final_count} agents remaining")) 