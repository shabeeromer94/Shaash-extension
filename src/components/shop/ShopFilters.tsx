import type { FilterOptions, Hairstyle, ProductFilters } from "@/lib/types";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ShopFiltersProps {
  options: FilterOptions;
  hairstyles: Hairstyle[];
  activeFilters: ProductFilters;
}

/**
 * A plain GET form — filtering/sorting happens via URL search params and a
 * full server render, so this needs zero client JS.
 */
export function ShopFilters({ options, hairstyles, activeFilters }: ShopFiltersProps) {
  return (
    <form action="/shop" method="get" className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <Select label="Texture" name="texture" defaultValue={activeFilters.texture ?? ""}>
          <option value="">All Textures</option>
          {options.textures.map((texture) => (
            <option key={texture} value={texture}>
              {texture}
            </option>
          ))}
        </Select>

        <Select label="Colour" name="colour" defaultValue={activeFilters.colour ?? ""}>
          <option value="">All Colours</option>
          {options.colours.map((colour) => (
            <option key={colour} value={colour}>
              {colour}
            </option>
          ))}
        </Select>

        <Select label="Hairstyle" name="hairstyle" defaultValue={activeFilters.hairstyle ?? ""}>
          <option value="">All Hairstyles</option>
          {hairstyles.map((style) => (
            <option key={style.id} value={style.slug}>
              {style.name}
            </option>
          ))}
        </Select>

        <Select label="Sort By" name="sort" defaultValue={activeFilters.sort ?? "featured"}>
          <option value="featured">Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
        <Input
          label={`Min Price (₹${options.minPrice})`}
          name="minPrice"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={activeFilters.minPrice ?? ""}
        />
        <Input
          label={`Max Price (₹${options.maxPrice})`}
          name="maxPrice"
          type="number"
          min={0}
          inputMode="numeric"
          defaultValue={activeFilters.maxPrice ?? ""}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="available"
          name="available"
          value="true"
          defaultChecked={activeFilters.availableOnly}
          className="h-4 w-4 rounded border-line text-charcoal focus:ring-charcoal"
        />
        <label htmlFor="available" className="text-sm text-charcoal-soft">
          In stock only
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Apply Filters
        </Button>
        <Button href="/shop" variant="ghost">
          Clear
        </Button>
      </div>
    </form>
  );
}
