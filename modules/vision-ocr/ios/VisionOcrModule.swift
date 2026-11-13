import ExpoModulesCore
import Vision

public class VisionOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VisionOcr")

    AsyncFunction("recognizeText") { (uri: URL) -> [String] in
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.recognitionLanguages = ["en-US", "fr-FR"]
      request.usesLanguageCorrection = true
      try VNImageRequestHandler(url: uri).perform([request])
      let observations = request.results ?? []
      return observations
        .sorted { a, b in
          abs(a.boundingBox.midY - b.boundingBox.midY) > 0.01
            ? a.boundingBox.midY > b.boundingBox.midY
            : a.boundingBox.minX < b.boundingBox.minX
        }
        .compactMap { $0.topCandidates(1).first?.string }
    }
  }
}
