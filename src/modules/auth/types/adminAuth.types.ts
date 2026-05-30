export type AdminProfile = {
  id: number;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: "admin";
};

export type AdminLoginResponse = {
  success: true;
  data: {
    accessToken: string;
    admin: AdminProfile;
  };
};

export type AdminProfileResponse = {
  success: true;
  data: AdminProfile;
};

export type AdminLogoutResponse = {
  success: true;
  message: string;
};
