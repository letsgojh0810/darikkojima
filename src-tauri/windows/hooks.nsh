; Windows keeps shortcut icons in a cache, so a desktop shortcut made by an older version kept its old icon after an
; update. Telling Explorer that associations changed makes it redraw them with the new exe icon.
!macro NSIS_HOOK_POSTINSTALL
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
