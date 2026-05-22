const iosInstallInstructionImage = (fileName: string) =>
  `/instruction/ios_install_instruction/${encodeURIComponent(fileName)}`;

export const iosInstallInstructionImages = [
  iosInstallInstructionImage('1_ios_share_icon.png'),
  iosInstallInstructionImage('2_ios_share_menu.png'),
  iosInstallInstructionImage('3_ios_install_on_home_screen_confirmation.png'),
] as const;
