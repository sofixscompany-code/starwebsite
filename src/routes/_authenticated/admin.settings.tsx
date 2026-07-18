import {  } from "react-router-dom";
import { useState } from "react";
import {
  Cog, PlugZap, Users, History, Download, Search, Save, Upload,
  ShieldCheck, KeyRound, Database, Bell, Mail, MessageSquare,
  Palette, Globe, CreditCard, Cloud, MapPin, Camera, Lock, Video,
  Eye, EyeOff, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import { StatCard, Panel, Badge, Tabs, Modal } from "@/components/admin/ui";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [showKeys, setShowKeys] = useState(false);

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Institute branding, integrations, security & system configuration."
        actions={
          <>
            <button className="ap-btn-ghost"><Upload className="w-4 h-4" /> Import</button>
            <button className="ap-btn"><Save className="w-4 h-4" /> Save Changes</button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Modules" value={12} icon={Cog} tone="purple" />
        <StatCard label="Integrations" value={12} icon={PlugZap} tone="orange" />
        <StatCard label="Active Users" value={148} icon={Users} tone="info" />
        <StatCard label="Last Change" value="2h ago" icon={History} tone="success" />
      </div>

      <Tabs
        tabs={[
          { label: "General", value: "general" },
          { label: "Branding", value: "branding" },
          { label: "Integrations", value: "integrations" },
          { label: "Notifications", value: "notifications" },
          { label: "Security", value: "security" },
          { label: "Backup", value: "backup" },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Institute Information">
              <div className="space-y-4">
                {[
                  ["Institute Name", "Star Coaching Institute Pvt. Ltd."],
                  ["Short Name", "Star Coaching"],
                  ["Established", "2018"],
                  ["Registration No", "EDU-2018-4521"],
                  ["PAN/VAT", "123456789"],
                ].map(([label, value]) => (
                  <label key={label} className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                    <input defaultValue={value} className="ap-input mt-1" />
                  </label>
                ))}
              </div>
            </Panel>
            <Panel title="Contact Information">
              <div className="space-y-4">
                {[
                  ["Email", "info.starcoaching@gmail.com"],
                  ["Phone", "+977-41-520XXX"],
                  ["Mobile", "+977-984XXXXXXX"],
                  ["Website", "www.starcoaching.edu.np"],
                  ["Address", "Janakpurdham-5, Dhanusha, Nepal"],
                ].map(([label, value]) => (
                  <label key={label} className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                    <input defaultValue={value} className="ap-input mt-1" />
                  </label>
                ))}
              </div>
            </Panel>
            <Panel title="Academic Settings">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Current Academic Year</span>
                  <select className="ap-input mt-1" defaultValue="2082">
                    <option value="2081">2081 BS</option>
                    <option value="2082">2082 BS</option>
                    <option value="2083">2083 BS</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Default Language</span>
                  <select className="ap-input mt-1" defaultValue="en">
                    <option value="en">English</option>
                    <option value="ne">Nepali</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Timezone</span>
                  <select className="ap-input mt-1" defaultValue="asia/kathmandu">
                    <option value="asia/kathmandu">Asia/Kathmandu (UTC+5:45)</option>
                  </select>
                </label>
              </div>
            </Panel>
            <Panel title="System Preferences">
              <div className="space-y-3">
                {[
                  ["Enable SMS Notifications", true],
                  ["Enable Email Notifications", true],
                  ["Enable WhatsApp Integration", false],
                  ["Auto-generate Admission Numbers", true],
                  ["Require Email Verification", false],
                  ["Enable Parent Portal", true],
                  ["Enable Online Fee Payment", true],
                  ["Enable Live Classes", true],
                ].map(([label, value]) => (
                  <label key={label as string} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--ap-border)/0.3)] cursor-pointer">
                    <span className="text-sm">{label}</span>
                    <input type="checkbox" defaultChecked={value === true} className="w-4 h-4 accent-[hsl(var(--ap-purple))]" />
                  </label>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Logo & Favicon">
              <div className="space-y-4">
                <div className="ap-card p-6 text-center border-2 border-dashed border-[hsl(var(--ap-border))]">
                  <Camera className="w-8 h-8 mx-auto text-[hsl(var(--ap-muted))] mb-2" />
                  <p className="text-sm font-semibold">Upload Logo</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">PNG, SVG · Max 2MB · 200x200px recommended</p>
                  <button className="ap-btn mt-3"><Upload className="w-4 h-4" /> Browse</button>
                </div>
                <div className="ap-card p-6 text-center border-2 border-dashed border-[hsl(var(--ap-border))]">
                  <Camera className="w-8 h-8 mx-auto text-[hsl(var(--ap-muted))] mb-2" />
                  <p className="text-sm font-semibold">Upload Favicon</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))] mt-1">ICO, PNG · 32x32px</p>
                  <button className="ap-btn mt-3"><Upload className="w-4 h-4" /> Browse</button>
                </div>
              </div>
            </Panel>
            <Panel title="Brand Colors">
              <div className="space-y-4">
                {[
                  ["Primary Color", "#6D28D9"],
                  ["Secondary Color", "#F97316"],
                  ["Background", "#F8FAFC"],
                  ["Text Color", "#1E293B"],
                  ["Success", "#22C55E"],
                  ["Warning", "#F59E0B"],
                  ["Danger", "#EF4444"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-[hsl(var(--ap-border))]" style={{ background: value }} />
                    <div className="flex-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">{label}</span>
                      <input defaultValue={value} className="ap-input mt-1 font-mono text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Payment Gateways">
              <div className="space-y-3">
                {[
                  { name: "eSewa", status: "Connected", icon: CreditCard },
                  { name: "Khalti", status: "Connected", icon: CreditCard },
                  { name: "IME Pay", status: "Disconnected", icon: CreditCard },
                  { name: "Bank Transfer", status: "Connected", icon: CreditCard },
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ap-border)/0.4)] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{g.name}</p>
                          <p className="text-xs text-[hsl(var(--ap-muted))]">Payment processing</p>
                        </div>
                      </div>
                      <Badge tone={g.status === "Connected" ? "success" : "muted"}>{g.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel title="Communication APIs">
              <div className="space-y-3">
                {[
                  { name: "SMS Gateway", status: "Connected", icon: MessageSquare },
                  { name: "SMTP Email", status: "Connected", icon: Mail },
                  { name: "WhatsApp API", status: "Disconnected", icon: MessageSquare },
                  { name: "Firebase Push", status: "Connected", icon: Bell },
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ap-border)/0.4)] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{g.name}</p>
                          <p className="text-xs text-[hsl(var(--ap-muted))]">Communication channel</p>
                        </div>
                      </div>
                      <Badge tone={g.status === "Connected" ? "success" : "muted"}>{g.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel title="Cloud Services">
              <div className="space-y-3">
                {[
                  { name: "Cloudinary", status: "Connected", icon: Cloud, desc: "Image & video storage" },
                  { name: "Google Maps", status: "Connected", icon: MapPin, desc: "Location services" },
                  { name: "Zoom API", status: "Connected", icon: Video, desc: "Live classes" },
                  { name: "Google Meet", status: "Disconnected", icon: Video, desc: "Alternative live class" },
                ].map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--ap-border)/0.4)] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{g.name}</p>
                          <p className="text-xs text-[hsl(var(--ap-muted))]">{g.desc}</p>
                        </div>
                      </div>
                      <Badge tone={g.status === "Connected" ? "success" : "muted"}>{g.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <Panel title="API Keys" subtitle="Manage your integration keys">
              <div className="space-y-3">
                {[
                  { name: "Firebase Project", value: "star-coaching-erp" },
                  { name: "SMS API Key", value: "sk_live_••••••••••••••••" },
                  { name: "Firebase Project ID", value: "star-coaching-erp" },
                  { name: "Cloudinary Cloud", value: "starcoaching" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--ap-border)/0.3)]">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-[hsl(var(--ap-muted))]">{k.name}</p>
                      <p className="text-sm font-mono truncate">{k.value}</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-[hsl(var(--ap-border)/0.5)]" onClick={() => setShowKeys(!showKeys)}>
                      {showKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Email Templates">
              <div className="space-y-2">
                {[
                  "Welcome Email", "Fee Receipt", "Attendance Alert", "Exam Result",
                  "Notice Broadcast", "Password Reset", "Admission Confirmation",
                ].map((t) => (
                  <div key={t} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)] cursor-pointer">
                    <span className="text-sm font-semibold">{t}</span>
                    <Badge tone="success">Active</Badge>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="SMS Templates">
              <div className="space-y-2">
                {[
                  "Fee Reminder", "Attendance Alert", "Exam Schedule", "Result Published",
                  "Notice Alert", "Admission Status",
                ].map((t) => (
                  <div key={t} className="flex items-center justify-between p-3 rounded-xl hover:bg-[hsl(var(--ap-border)/0.3)] cursor-pointer">
                    <span className="text-sm font-semibold">{t}</span>
                    <Badge tone="success">Active</Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Security Settings">
              <div className="space-y-3">
                {[
                  ["Two-Factor Authentication", false],
                  ["Session Timeout (minutes)", "30"],
                  ["Password Min Length", "8"],
                  ["Login Attempt Limit", "5"],
                  ["IP Whitelist", ""],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between p-2">
                    <span className="text-sm">{label}</span>
                    {typeof value === "boolean" ? (
                    <input type="checkbox" defaultChecked={Boolean(value)} className="w-4 h-4 accent-[hsl(var(--ap-purple))]" />
                    ) : (
                      <input defaultValue={value} className="ap-input w-32 text-sm" />
                    )}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Audit Log" subtitle="Recent system changes">
              <div className="space-y-2">
                {[
                  { action: "Updated institute name", by: "Admin", time: "2h ago", icon: CheckCircle2 },
                  { action: "Added new API key", by: "Admin", time: "5h ago", icon: KeyRound },
                  { action: "Changed password policy", by: "Super Admin", time: "1d ago", icon: Lock },
                  { action: "Enabled eSewa gateway", by: "Admin", time: "3d ago", icon: CreditCard },
                ].map((l, i) => {
                  const Icon = l.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                      <Icon className="w-4 h-4 text-[hsl(var(--ap-purple))]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{l.action}</p>
                        <p className="text-xs text-[hsl(var(--ap-muted))]">{l.by} · {l.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}

        {activeTab === "backup" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel title="Backup & Restore">
              <div className="space-y-4">
                <div className="ap-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Last Backup</span>
                    <Badge tone="success">Success</Badge>
                  </div>
                  <p className="text-sm text-[hsl(var(--ap-muted))]">Oct 10, 2024 at 3:00 AM</p>
                  <p className="text-xs text-[hsl(var(--ap-muted))]">Size: 245 MB · Auto backup</p>
                </div>
                <div className="flex gap-3">
                  <button className="ap-btn flex-1 justify-center"><Database className="w-4 h-4" /> Backup Now</button>
                  <button className="ap-btn-ghost flex-1 justify-center"><Upload className="w-4 h-4" /> Restore</button>
                </div>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--ap-muted))]">Backup Schedule</span>
                  <select className="ap-input mt-1" defaultValue="6h">
                    <option value="1h">Every hour</option>
                    <option value="6h">Every 6 hours</option>
                    <option value="24h">Daily</option>
                    <option value="manual">Manual only</option>
                  </select>
                </label>
              </div>
            </Panel>
            <Panel title="Backup History">
              <div className="space-y-2">
                {[
                  { date: "Oct 10, 2024", size: "245 MB", status: "Success", type: "Auto" },
                  { date: "Oct 9, 2024", size: "242 MB", status: "Success", type: "Auto" },
                  { date: "Oct 8, 2024", size: "238 MB", status: "Success", type: "Auto" },
                  { date: "Oct 7, 2024", size: "235 MB", status: "Success", type: "Manual" },
                  { date: "Oct 6, 2024", size: "230 MB", status: "Failed", type: "Auto" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--ap-border)/0.3)]">
                    <div>
                      <p className="text-sm font-semibold">{b.date}</p>
                      <p className="text-xs text-[hsl(var(--ap-muted))]">{b.size} · {b.type}</p>
                    </div>
                    <Badge tone={b.status === "Success" ? "success" : "danger"}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}


