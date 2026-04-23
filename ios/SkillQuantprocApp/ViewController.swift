import UIKit
import WebKit
import CoreLocation

class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, CLLocationManagerDelegate {
    private let webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
    private let locationManager = CLLocationManager()
    private let appURL = URL(string: "https://skill.quantproc.com")!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "SKILL"
        view.backgroundColor = .systemBackground

        locationManager.delegate = self

        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        webView.load(URLRequest(url: appURL))
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        locationManager.requestWhenInUseAuthorization()
    }

    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }
}
