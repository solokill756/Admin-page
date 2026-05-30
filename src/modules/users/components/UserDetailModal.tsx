import { AdminUser } from "../types/adminUser.types";

type UserDetailModalProps = {
  user: AdminUser;
  onClose: () => void;
};

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="food-modal user-detail-modal" role="dialog" aria-modal="true" aria-labelledby="user-detail-title">
        <div className="modal-header">
          <div>
            <p className="section-kicker">User</p>
            <h2 id="user-detail-title">{user.displayName || "User detail"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">x</button>
        </div>

        <div className="detail-grid">
          <DetailItem label="Email" value={user.email || "-"} />
          <DetailItem label="Role" value={user.role} />
          <DetailItem label="Status" value={user.isActive ? "Active" : "Blocked"} />
          <DetailItem label="Profile" value={user.isProfileComplete ? "Complete" : "Incomplete"} />
          <DetailItem label="Age" value={user.age == null ? "-" : String(user.age)} />
          <DetailItem label="Sex" value={user.sex || "-"} />
          <DetailItem label="Height" value={user.height == null ? "-" : `${user.height} cm`} />
          <DetailItem label="Weight" value={user.weight == null ? "-" : `${user.weight} kg`} />
          <DetailItem label="Goal Weight" value={user.goalWeight == null ? "-" : `${user.goalWeight} kg`} />
          <DetailItem label="Diet Type" value={user.dietType || "-"} />
          <DetailItem label="Fitness Level" value={user.fitnessLevel || "-"} />
          <DetailItem label="Allergies" value={user.allergies.length ? user.allergies.join(", ") : "-"} />
          <DetailItem label="Last Login" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "-"} />
          <DetailItem label="Created" value={formatDateTime(user.createdAt)} />
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
