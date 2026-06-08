
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ServiceType, Objective, SubCampaignType } from '@/services/api';
import { toast } from 'sonner';

interface CreateSubCampaignDialogProps {
    brandId: string;
    parentId: string;
    parentName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateSubCampaignDialog = ({ brandId, parentId, parentName, open, onOpenChange, onSuccess }: CreateSubCampaignDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState<ServiceType[]>([]);
    const [subCampaignTypes, setSubCampaignTypes] = useState<SubCampaignType[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);

    const [formData, setFormData] = useState({
        serviceTypeId: '',
        subCampaignTypeId: '',
        objectiveId: '',
        budgetPlanned: 0
    });

    useEffect(() => {
        if (open) {
            fetchOptions();
        }
    }, [open]);

    // Fetch dependent sub-types when service changes
    useEffect(() => {
        const fetchSubTypes = async () => {
            if (formData.serviceTypeId) {
                try {
                    const types = await api.subCampaignTypes.getAll(formData.serviceTypeId);
                    setSubCampaignTypes(types);
                } catch (e) {
                    console.error("Failed to fetch sub types", e);
                }
            } else {
                setSubCampaignTypes([]);
            }
        };
        fetchSubTypes();
    }, [formData.serviceTypeId]);

    const fetchOptions = async () => {
        try {
            const [svcData, objData] = await Promise.all([
                api.serviceTypes.getAll(),
                api.objectives.getAll()
            ]);
            setServices(svcData);
            setObjectives(objData);
        } catch (error) {
            console.error("Failed to fetch options", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedService = services.find(s => s.id === formData.serviceTypeId);
            const selectedSubType = subCampaignTypes.find(t => t.id === formData.subCampaignTypeId);

            const serviceName = selectedService ? selectedService.name : 'Service';
            const subName = selectedSubType ? ` (${selectedSubType.name})` : '';

            const campaignName = `${parentName} - ${serviceName}${subName}`;
            const slug = campaignName.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

            await api.campaigns.createSubCampaign({
                name: campaignName,
                slug,
                campaignId: parentId,
                status: 'active',
                serviceTypeId: formData.serviceTypeId,
                subCampaignTypeId: formData.subCampaignTypeId,
                objectiveId: formData.objectiveId,
                budgetPlanned: formData.budgetPlanned,
            });

            toast.success("Service added successfully");
            onSuccess();
            onOpenChange(false);
            setFormData({ serviceTypeId: '', subCampaignTypeId: '', objectiveId: '', budgetPlanned: 0 });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add service");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl font-medium tracking-tight text-foreground">Add service</DialogTitle>
                    <DialogDescription className="font-serif text-sm text-foreground-soft">
                        Add a service execution to <strong className="text-foreground font-medium">{parentName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="service" className="text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft">Service</Label>
                            <Select
                                value={formData.serviceTypeId}
                                onValueChange={val => setFormData({ ...formData, serviceTypeId: val })}
                            >
                                <SelectTrigger className="col-span-3 bg-background-2 border-border text-foreground">
                                    <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border h-[200px]">
                                    {services.map(svc => (
                                        <SelectItem key={svc.id} value={svc.id} className="text-foreground-soft focus:bg-foreground/[0.06] focus:text-foreground">
                                            {svc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="obj" className="text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft">Objective</Label>
                            <Select
                                value={formData.objectiveId}
                                onValueChange={val => setFormData({ ...formData, objectiveId: val })}
                            >
                                <SelectTrigger className="col-span-3 bg-background-2 border-border text-foreground">
                                    <SelectValue placeholder="Select objective" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {objectives.map(obj => (
                                        <SelectItem key={obj.id} value={obj.id} className="text-foreground-soft focus:bg-foreground/[0.06] focus:text-foreground">
                                            {obj.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right font-mono text-2xs uppercase tracking-widest text-foreground-soft">Budget</Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budgetPlanned}
                                onChange={e => setFormData({ ...formData, budgetPlanned: Number(e.target.value) })}
                                className="col-span-3 bg-background-2 border-border text-foreground"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-foreground-soft hover:text-foreground">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-foreground text-background hover:bg-primary">
                            {loading ? 'Adding…' : 'Add service'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
