import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { SmtpForm } from "@/components/admin/smtp-form";
import { ThemeForm } from "@/components/admin/theme-form";
import { SiteContentForm } from "@/components/admin/site-content-form";

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <PageHeader title="Settings" description="Site configuration: brand, bilingual content, colors and email delivery." />
      <div className="space-y-6">
        <Card>
          <CardHeader><h3 className="font-semibold">Site Content (EN / AR)</h3></CardHeader>
          <CardContent>
            <SiteContentForm initial={map} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Colors & Theme</h3>
            <p className="text-xs text-muted-foreground">Global palette applies to the whole site. Locale overrides let you use different brand colors on the English and Arabic sites.</p>
          </CardHeader>
          <CardContent>
            <ThemeForm initial={map} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="font-semibold">Site Contact Info</h3></CardHeader>
          <CardContent>
            <SettingsForm initial={map} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h3 className="font-semibold">SMTP / Email</h3></CardHeader>
          <CardContent>
            <SmtpForm initial={map} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}