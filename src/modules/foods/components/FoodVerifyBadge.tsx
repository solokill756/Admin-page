type FoodVerifyBadgeProps = {
  isVerified: boolean;
};

export function FoodVerifyBadge({ isVerified }: FoodVerifyBadgeProps) {
  return (
    <span className={`verify-badge ${isVerified ? "verify-badge-on" : "verify-badge-off"}`}>
      {isVerified ? "Verified" : "Unverified"}
    </span>
  );
}
