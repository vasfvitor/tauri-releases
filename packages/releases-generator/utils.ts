export function entitify(str: string): string {
	return str
		.replace(/[&<>"']/g, (entity) => {
			switch (entity) {
				case "&":
					return "&amp;";
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case '"':
					return "&quot;";
				case "'":
					return "&#39;";
				default:
					return entity;
			}
		})
		.replace(/\$\{/g, "$\\{");
}
