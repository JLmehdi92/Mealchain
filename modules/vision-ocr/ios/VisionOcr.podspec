Pod::Spec.new do |s|
  s.name           = 'VisionOcr'
  s.version        = '1.0.0'
  s.summary        = 'On-device text recognition with Apple Vision'
  s.description    = 'Reads the text of a recipe screenshot on the device with VNRecognizeTextRequest.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
