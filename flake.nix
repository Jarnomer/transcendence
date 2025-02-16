{
  description = "Transcendence Dev Shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      ...
    }@inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_23
            sqlite
          ];
          shellHook = ''
            echo "Launching development shell..."
            echo "Using node version: `${pkgs.nodejs_23}/bin/node -v`"
            if [ ! -d "node_modules" ]; then
              if [ ! -f "package.json" ]; then
                echo "Initializing package.json..."
                npm init -y
              fi
              echo "Installing dependencies..."
              npm i -D typescript vite tailwindcss \
                babylonjs sqlite3 fastify > /dev/null 2>&1
            else
              echo "All packages installed!"
            fi
            echo "Creating containers..."
            make all > /dev/null 2>&1
            trap 'make clean' EXIT
          '';
        };
      }
    );
}
