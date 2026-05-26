interface IAppOption {
  globalData: {
    currentSpaceId: string;
    user: import('./domain').AppUser | null;
  };
}
