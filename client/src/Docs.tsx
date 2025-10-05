import React from 'react';

const Docs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-red-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white">Firebase Deployment Troubleshooting Guide</h1>
        </div>
        <div className="px-6 py-8">
          <section className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              If you're encountering an "internal error" (e.g., error ID: fdb404e5b13645b19a696a1bc6029f65) during Firebase deployment via GitHub Actions, this guide will help you diagnose and resolve the issue step by step.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Troubleshooting Steps</h2>
            <ol className="space-y-6">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">1</span>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Check Build and Deploy Logs in GitHub Actions</strong></p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Navigate to your GitHub repository.</li>
                    <li>Go to the "Actions" tab.</li>
                    <li>Click on the latest failed workflow run.</li>
                    <li>Expand the "Deploy to Firebase" job to view detailed logs and error messages.</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">2</span>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Apply Common Fixes</strong></p>
                  <ul className="space-y-3">
                    <li className="bg-green-50 p-3 rounded">
                      <strong>Verify FIREBASE_SERVICE_ACCOUNT Secret:</strong> Ensure the FIREBASE_SERVICE_ACCOUNT secret in GitHub is set to the exact JSON from your Firebase service account key file. It must include all fields like type, project_id, etc. No extra spaces or modifications.
                    </li>
                    <li className="bg-green-50 p-3 rounded">
                      <strong>Enable Firebase Hosting:</strong> In Firebase Console, select your project (e.g., studio-7693519829-4e97b), go to Hosting, and click "Get Started" to enable it.
                    </li>
                    <li className="bg-green-50 p-3 rounded">
                      <strong>Check Service Account Permissions:</strong> Ensure the service account has the Firebase Admin role. In Google Cloud Console > IAM, verify the account's roles.
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">3</span>
                <div>
                  <p className="text-gray-700 mb-2"><strong>Retry Deployment</strong></p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Make a small change, such as adding a comment in <code className="bg-gray-100 px-1 rounded">client/src/App.tsx</code>.</li>
                    <li>Run <code className="bg-gray-100 px-1 rounded">.\deploy.bat</code> (Windows) or commit/push manually:</li>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li><code className="bg-gray-100 px-1 rounded">git add .</code></li>
                      <li><code className="bg-gray-100 px-1 rounded">git commit -m "Retry deploy"</code></li>
                      <li><code className="bg-gray-100 px-1 rounded">git push origin main</code></li>
                    </ul>
                    <li>This triggers a new GitHub Actions run.</li>
                  </ul>
                </div>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Help</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-gray-700">
                If you see specific errors like "Invalid credentials" or "Project not found" in the logs, double-check your secrets and project ID. Some Firebase internal errors may resolve on retry. If issues persist, share the error logs for further assistance.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Docs;
