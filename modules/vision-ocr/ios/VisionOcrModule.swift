import ExpoModulesCore
import Vision

// Vision's origin is bottom-left; rounding to 1% bands keeps a line together and gives sort a strict weak order.
private func band(_ observation: VNRecognizedTextObservation) -> Int {
  Int(((1 - observation.boundingBox.midY) * 100).rounded())
}

public class VisionOcrModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VisionOcr")

    AsyncFunction("recognizeText") { (uri: URL) -> [String] in
      let request = VNRecognizeTextRequest()
      request.recognitionLevel = .accurate
      request.recognitionLanguages = ["en-US", "fr-FR"]
      request.usesLanguageCorrection = false
      try VNImageRequestHandler(url: uri).perform([request])
      let observations = request.results ?? []
      return observations
        .sorted { a, b in
          (band(a), a.boundingBox.minX) < (band(b), b.boundingBox.minX)
        }
        .compactMap { $0.topCandidates(1).first?.string }
    }
  }
}
