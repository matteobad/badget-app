import WorkForm from "../_components/work-form";

export default function SettingsAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Working Situation</h3>
        <p className="text-sm text-muted-foreground">
          Update your working situation. This will help us make more precise
          forecasting on your net worth.
        </p>
      </div>
      <WorkForm />
    </div>
  );
}
