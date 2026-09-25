import type { Address } from "@/contexts/AuthContext";

type AddressPickerProps = {
	label: string;
	addresses: Address[];
	value: number | null;
	onChange: (addressId: number) => void;
};

export default function AddressPicker({
	label,
	addresses,
	value,
	onChange,
}: AddressPickerProps) {
	return (
		<fieldset className="min-w-0 mt-4">
			<legend className="font-bold text-primary pb-2">{label}</legend>
			<div className="flex min-w-0 flex-col gap-2">
				{addresses.map((address) => {
					const isSelected = value === address.id;

					return (
						<button
							key={address.id}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onChange(address.id)}
							className={`w-full rounded-2xl border border-primary p-3 text-left text-primary shadow-none transition-colors ${
								isSelected
									? "bg-primary/10 border-2"
									: "bg-transparent hover:bg-primary/10"
							}`}
						>
							<span className="font-bold">
								{address.label ?? `Adresse ${address.id}`}
							</span>
							<span className="block text-sm">
								{address.street_line
									? `${address.street_line}, `
									: ""}
								{address.postal_code} {address.city}
							</span>
						</button>
					);
				})}
			</div>
		</fieldset>
	);
}
