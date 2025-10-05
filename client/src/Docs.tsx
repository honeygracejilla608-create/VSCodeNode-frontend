import React from 'react';

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <li className="flex items-start mb-6">
    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-4 mt-1 flex-shrink-0">
      {number}
    </span>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  </li>
);

const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-green-50 border-l-4 border-green-400 p-4 my-2 rounded">
    {children}
  </div>
);

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
    {children}
  </div>
);

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
              This guide helps you diagnose and resolving common Firebase deployment errors encountered during GitHub Actions workflows, ensuring smooth CI/CD for your projects.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sequential Troubleshooting Steps</h2>
            <ol className="space-y-6">
              <Step number={1} title="Check Deployment Logs in GitHub Actions">
                <p className="text-gray-700 mb-2">Review the detailed logs to identify the specific error.</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Navigate to your GitHub repository.</li>
                  <li>Go to the "Actions" tab.</li>
                  <li>Click on the latest failed workflow run.</li>
                  <li>Expand the "Deploy to Firebase" job to view error messages.</li>
                </ul>
              </Step>

              <Step number={2} title="Verify Secrets and Environment Variables">
                <p className="text-gray-700 mb-2">Ensure all required secrets are correctly configured.</p>
                <Callout>
                  <strong>Fix:</strong> Confirm the <code className="bg-gray-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT</code> secret in GitHub repository settings is set to the exact JSON from your Firebase service account key file, including all fields like <code className="bg-gray-100 px-1 rounded">type</code>, <code className="bg-gray-100 px-1 rounded">project_id</code>, etc. No extra spaces or modifications.
                </Callout>
              </Step>

              <Step number={3} title="Confirm Firebase Hosting Configuration">
                <p className="text-gray-700 mb-2">Ensure Firebase Hosting is properly set up for your project.</p>
                <Callout>
                  <strong>Fix:</strong> In Firebase Console, select your project, navigate to Hosting, and click "Get Started" to enable it. Verify the project ID in your workflow matches (e.g., <code className="bg-gray-100 px-1 rounded">studio-7693519829-4e97b</code>).
                </Callout>
              </Step>

              <Step number={4} title="Review Permissions and Access Controls">
                <p className="text-gray-700 mb-2">Check that the service account has the necessary permissions.</p>
                <Callout>
                  <strong>Fix:</strong> Ensure the service account has the Firebase Admin role. In Google Cloud Console > IAM, verify the account's roles for your project.
                </Callout>
              </Step>

              <Step number={5} title="Retry Deployment">
                <p className="text-gray-700 mb-2">Trigger a new deployment attempt after fixes.</p>
                <Callout>
                  <strong>Fix:</strong> Make a small change (e.g., edit a comment in <code className="bg-gray-100 px-1 rounded">client/src/App.tsx</code>), then run <code className="bg-gray-100 px-1 rounded">.\deploy.bat</code> or manually: <code className="bg-gray-100 px-1 rounded">git add .</code>, <code className="bg-gray-100 px-1 rounded">git commit -m "Retry deploy"</code>, <code className="bg-gray-100 px-1 rounded">git push origin main</code>.
                </Callout>
              </Step>
            </ol>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Additional Help</h2>
            <InfoBox>
              <p className="text-gray-700">
                If these steps don't resolve the issue, check for specific error messages like "Invalid credentials" or "Project not found." Some Firebase internal errors may resolve on retry. For further assistance, consult the Firebase documentation or contact support.
              </p>
            </InfoBox>
          </section>
        </div>
      </div>
    </div>
  );

export default Docs;
