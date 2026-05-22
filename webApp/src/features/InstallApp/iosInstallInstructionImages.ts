const iosInstallInstructionImage = (fileName: string) =>
  `/instruction/ios_install_instruction/${encodeURIComponent(fileName)}`;

export const iosInstallInstructionImages = [
  iosInstallInstructionImage('1. ios_share_icon.png'),
  iosInstallInstructionImage('2. ios_share_menu.png'),
  iosInstallInstructionImage('2. ios_install_on_home_screen_confirmation.png'),
] as const;
