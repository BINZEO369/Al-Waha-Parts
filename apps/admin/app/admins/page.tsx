import { AdminResourcePanel } from '../../components/AdminResourcePanel';
import { SectionHeader, WorkspaceCard } from '../../components/AdminSection';

export default function Admins() {
  return (
    <div className="admin-page">
      <SectionHeader
        eyebrow="Team access / section 06"
        title="Admin access"
        description="Review who can enter the operations desk, which role they hold, and whether their access is active."
        action="Invite admin"
      />
      <section className="workspace-hero dark-wash">
        <div>
          <span className="eyebrow">
            <b>06</b>Access control
          </span>
          <h2>Secure access, clear responsibility.</h2>
          <p>
            Only Supabase-authenticated users with an active admin record can access live
            operations.
          </p>
        </div>
        <div className="hero-mark">AD</div>
      </section>
      <AdminResourcePanel kind="admins" />
      <div className="workspace-grid">
        <WorkspaceCard
          number="06A"
          label="People"
          title="Know who is inside."
          description="Review names, emails, roles, and active status before granting access."
          action="Review admins"
        />
        <WorkspaceCard
          number="06B"
          label="Permissions"
          title="Match access to responsibility."
          description="Keep catalog, bookings, and operations responsibilities clear as the team grows."
          action="Review roles"
        />
      </div>
    </div>
  );
}
